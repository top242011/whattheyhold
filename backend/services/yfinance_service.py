import yfinance as yf
import pandas as pd
import datetime
from typing import List, Dict, Any
from models.schemas import FundResponse, FundInfo, Holding, CountryWeight, SectorWeight
from services.country_mapper import get_country_code
from dataclasses import dataclass

# In-memory cache for MVP (Global dict)
FUND_CACHE = {}



import random
from services.db_service import db_service

# Common user agents to rotate and prevent 403 blocks
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0'
]

def get_fund_data(ticker: str, force_refresh: bool = False) -> FundResponse:
    # 1. Check DB Cache
    db_data = db_service.get_fund(ticker)
    
    # Check if DB data exists AND is fresh
    if not force_refresh and db_data and db_data.last_updated:
        if db_service.is_cache_fresh(db_data.last_updated):
            print(f"Serving {ticker} from Supabase DB (Fresh)")
            return db_data
        else:
             print(f"DB cache for {ticker} is stale (Last updated: {db_data.last_updated}). Refreshing...")
    elif db_data and not force_refresh:
         print(f"DB cache for {ticker} exists but no timestamp. Refreshing...")

    # 2. Check In-Memory Cache (Fallback)
    ticker = ticker.upper()
    if not force_refresh and ticker in FUND_CACHE:
        print(f"Serving {ticker} from cache")
        return FUND_CACHE[ticker]

    print(f"Fetching {ticker} from yfinance...")
    
    # Simple anti-blocking: Setup yfinance session with rotating user agent
    from curl_cffi import requests
    session = requests.Session(impersonate="chrome")
    session.headers['User-agent'] = random.choice(USER_AGENTS)

    try:
        # USER SUGGESTION IMPLEMENTATION
        # Create Ticker Object
        y_ticker = yf.Ticker(ticker, session=session)
        
        # Try to get funds_data
        funds_data = y_ticker.funds_data
        
        holdings_list: List[Holding] = []
        sector_weights_list: List[SectorWeight] = []
        
        # 1. Holdings
        if hasattr(funds_data, 'top_holdings'):
            top_holdings = funds_data.top_holdings
            if isinstance(top_holdings, pd.DataFrame):
                for index, row in top_holdings.iterrows():
                     pct = 0.0
                     if '% Assets' in row:
                         pct = float(row['% Assets'])
                     elif 'Holding Percent' in row:
                         pct = float(row['Holding Percent'])
                     
                     holdings_list.append(Holding(
                         ticker=str(index),
                         name=str(row['Name']) if 'Name' in row else str(index),
                         pct=pct * 100 
                     ))
        
        # 2. Sector Weightings
        if hasattr(funds_data, 'sector_weightings'):
             sector_data = funds_data.sector_weightings
             if isinstance(sector_data, dict):
                 for sector, weight in sector_data.items():
                     sector_weights_list.append(SectorWeight(sector=sector, weight_pct=float(weight) * 100))
             elif isinstance(sector_data, pd.DataFrame):
                 for index, row in sector_data.iterrows():
                     val = row.iloc[0] if not row.empty else 0
                     sector_weights_list.append(SectorWeight(sector=str(index), weight_pct=float(val) * 100))

        # Basic Info fallback
        info = y_ticker.info
        fund_info = FundInfo(
            ticker=ticker,
            name=info.get("longName", info.get("shortName", ticker)),
            price=info.get("previousClose", 0.0),
            currency=info.get("currency", "USD")
        )

        # Normalize Holdings Pct
        if holdings_list:
             max_pct = max([h.pct for h in holdings_list])
             if max_pct > 100:
                 for h in holdings_list:
                     h.pct /= 100

        # Create Country Weights
        country_weights: List[CountryWeight] = []
        country_map = {}
        for h in holdings_list:
            c_code = get_country_code(h.ticker)
            if c_code not in country_map:
                country_map[c_code] = 0.0
            country_map[c_code] += h.pct
            
        for code, weight in country_map.items():
            country_weights.append(CountryWeight(country_code=code, weight_pct=weight))
            
        # If no holdings found, mock some US exposure for MVP reliability
        # But for DB test, let's allow saving if at least basic info is there
        if not holdings_list and not fund_info.price:
             raise ValueError("No data found")
             
        # But if we have info but no holdings (rare for VOO), maybe fine to return what we have?
        # Let's keep existing logic to fail over to mock if strictly empty

        if not holdings_list: 
             # Only use mock fallback if absolutely no data
             # But wait, if we fallback to mock, should we save mock to DB?
             # Probably NOT, or "Mock Data" title will show up. 
             # Let's fallback to Mock in the Exception block.
             raise ValueError("No holdings found")

        response = FundResponse(
            fund=fund_info,
            holdings=holdings_list,
            country_weights=country_weights,
            sector_weights=sector_weights_list,
            last_updated=datetime.datetime.now(datetime.timezone.utc).isoformat()
        )
        
        # Save to Caches
        FUND_CACHE[ticker] = response
        db_service.upsert_fund(response)
        
        return response

    except Exception as e:
        print(f"Error fetching {ticker}: {e}")
        # Fallback to Stale DB Data if available
        if db_data:
            print(f"yfinance failed. Serving stale data for {ticker} from DB.")
            return db_data

        print("No DB data available. Returning None.")
        return None
