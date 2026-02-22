"""
SEC Open Data API Service
Interacts with the SEC Thailand Open Data API to fetch Thai mutual fund data.
Documentation: https://secopendata.sec.or.th

Confirmed API Endpoints (from SEC Open Data portal):
  #1  AMC List:          GET /v1/fund/general-info/amcs
  #2  Fund Profiles:     GET /v1/fund/general-info/profiles
  #3  Special Types:     GET /v1/fund/general-info/specifications
  #11 Risk Spectrum:     GET /v1/fund/factsheet/risk-spectrum
  #16 Asset Allocation:  GET /v1/fund/factsheet/asset-allocation
  #17 Top 5 Holdings:    GET /v1/fund/factsheet/top5-holdings
  #18 Quarterly Portfolio: GET /v1/fund/outstanding/portfolio
  #20 Daily NAV:         GET /v1/fund/daily-info/nav
"""

import os
import time
import requests
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

SEC_API_BASE_URL = os.environ.get("SEC_API_BASE_URL", "https://api.sec.or.th")
SEC_API_KEY = os.environ.get("SEC_API_KEY", "")

# Rate limit: pause between requests to respect SEC API limits
REQUEST_DELAY_SECONDS = 0.5


class SECService:
    """Client for SEC Thailand Open Data API."""

    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or SEC_API_KEY
        self.base_url = (base_url or SEC_API_BASE_URL).rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "Ocp-Apim-Subscription-Key": self.api_key,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
        })
        self._last_request_time = 0.0

    def _throttle(self):
        """Simple rate limiter to avoid hitting SEC API limits."""
        elapsed = time.time() - self._last_request_time
        if elapsed < REQUEST_DELAY_SECONDS:
            time.sleep(REQUEST_DELAY_SECONDS - elapsed)
        self._last_request_time = time.time()

    def _get(self, path: str, params: dict = None) -> dict:
        """Make a GET request to the SEC API."""
        self._throttle()
        url = f"{self.base_url}{path}"
        try:
            resp = self.session.get(url, params=params, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as e:
            print(f"SEC API HTTP error: {e} — URL: {url}")
            raise
        except requests.exceptions.RequestException as e:
            print(f"SEC API request error: {e} — URL: {url}")
            raise

    def _get_items(self, path: str, params: dict = None) -> tuple:
        """
        Make a GET request and extract items from the standard SEC response format.
        Returns: (items_list, total_pages, total_items)
        
        Standard response format:
        {
            "message": "success",
            "current_page": 1,
            "total_pages": N,
            "page_size": 1,
            "total_items": N,
            "items": [...]
        }
        """
        data = self._get(path, params)
        if isinstance(data, dict):
            items = data.get("items", [])
            total_pages = data.get("total_pages", 1)
            total_items = data.get("total_items", len(items))
            return items, total_pages, total_items
        return data if isinstance(data, list) else [], 1, 0

    # ─── AMC (Asset Management Companies) ───────────────────────────

    def get_amc_list(self, page: int = 1) -> List[Dict[str, Any]]:
        """Get list of all AMCs (บลจ.)."""
        items, _, _ = self._get_items(
            "/v1/fund/general-info/amcs",
            params={"current_page": page}
        )
        return items

    # ─── Fund Profiles ──────────────────────────────────────────────

    def get_fund_profiles(self, page: int = 1,
                          search: str = None) -> Dict[str, Any]:
        """
        Get fund profile list (กองทุนรวมภายใต้การบริหารจัดการของ บลจ.).
        
        Response items include:
        - proj_id, unique_id
        - proj_name_th / proj_name_en  (from comp_name_th/en context)
        - feederfund_master_fund: name of master fund (if feeder)
        - feederfund_country: country of master fund
        - policy_desc, investment_policy_desc, etc.
        """
        params = {"current_page": page}
        if search:
            params["search"] = search

        return self._get("/v1/fund/general-info/profiles", params=params)

    def get_all_fund_profiles(self, max_pages: int = None) -> List[Dict[str, Any]]:
        """
        Fetch ALL fund profiles across all pages.
        
        Args:
            max_pages: Limit number of pages fetched (None = all pages)
            
        Returns:
            List of all fund profile dicts
        """
        all_funds = []
        page = 1

        while True:
            print(f"  Fetching fund profiles page {page}...")
            data = self.get_fund_profiles(page=page)

            # Extract items from response
            items = []
            if isinstance(data, dict):
                items = data.get("items", [])
                total_pages = data.get("total_pages", 1)
            elif isinstance(data, list):
                items = data
                total_pages = 1

            if not items:
                print(f"  No items on page {page}, stopping.")
                break

            all_funds.extend(items)
            print(f"  Got {len(items)} funds (total so far: {len(all_funds)})")

            if page >= total_pages:
                break
            if max_pages and page >= max_pages:
                print(f"  Reached max_pages limit ({max_pages})")
                break

            page += 1

        print(f"  Total funds fetched: {len(all_funds)}")
        return all_funds

    # ─── Special Fund Types ─────────────────────────────────────────

    def get_special_fund_types(self, page: int = 1,
                               search: str = None) -> List[Dict[str, Any]]:
        """Get special fund type flags (feeder, FIF, LTF, RMF, etc.)."""
        params = {"current_page": page}
        if search:
            params["search"] = search
        items, _, _ = self._get_items(
            "/v1/fund/general-info/specifications", params=params
        )
        return items

    # ─── Fund Holdings ──────────────────────────────────────────────

    def get_top5_holdings(self, proj_id: str,
                          start_date: str = None,
                          end_date: str = None,
                          page: int = 1) -> List[Dict[str, Any]]:
        """Get top 5 holdings for a fund."""
        params = {"proj_id": proj_id, "current_page": page}
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        items, _, _ = self._get_items(
            "/v1/fund/factsheet/top5-holdings", params=params
        )
        return items

    def get_quarterly_portfolio(self, proj_id: str,
                                start_period: str = None,
                                end_period: str = None,
                                page: int = 1) -> List[Dict[str, Any]]:
        """
        Get quarterly portfolio holdings.
        
        Args:
            proj_id: Fund project ID
            start_period: Start period in YYYYMM format
            end_period: End period in YYYYMM format
        """
        params = {"proj_id": proj_id, "current_page": page}
        if start_period:
            params["period_start"] = start_period
        if end_period:
            params["period_end"] = end_period

        items, _, _ = self._get_items(
            "/v1/fund/outstanding/portfolio", params=params
        )
        return items

    # ─── NAV Data ───────────────────────────────────────────────────

    def get_daily_nav(self, proj_id: str,
                      begin_date: str = None,
                      end_date: str = None,
                      page: int = 1) -> List[Dict[str, Any]]:
        """
        Get daily NAV data.
        
        Args:
            proj_id: Fund project ID
            begin_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
        """
        params = {"proj_id": proj_id, "current_page": page}
        if begin_date:
            params["start_date"] = begin_date
        if end_date:
            params["end_date"] = end_date

        items, _, _ = self._get_items(
            "/v1/fund/daily-info/nav", params=params
        )
        return items

    # ─── Asset Allocation ───────────────────────────────────────────

    def get_asset_allocation(self, proj_id: str,
                             page: int = 1) -> List[Dict[str, Any]]:
        """Get monthly asset allocation breakdown."""
        params = {"proj_id": proj_id, "current_page": page}
        items, _, _ = self._get_items(
            "/v1/fund/factsheet/asset-allocation", params=params
        )
        return items

    # ─── Risk Spectrum ──────────────────────────────────────────────

    def get_risk_spectrum(self, proj_id: str,
                          page: int = 1) -> List[Dict[str, Any]]:
        """Get fund risk spectrum data."""
        params = {"proj_id": proj_id, "current_page": page}
        items, _, _ = self._get_items(
            "/v1/fund/factsheet/risk-spectrum", params=params
        )
        return items

    # ─── Feeder Fund Helpers ────────────────────────────────────────

    @staticmethod
    def is_feeder_fund(fund_profile: Dict[str, Any]) -> bool:
        """Check if a fund profile indicates it's a feeder fund."""
        master_fund = fund_profile.get("feederfund_master_fund", "")
        if master_fund and str(master_fund).strip():
            return True
        
        # Also check policy description for feeder fund keywords
        policy = str(fund_profile.get("policy_desc", "")).lower()
        inv_policy = str(fund_profile.get("investment_policy_desc", "")).lower()
        combined = policy + " " + inv_policy

        feeder_keywords = ["feeder fund", "feeder", "master fund", "กองทุนหลัก"]
        return any(kw in combined for kw in feeder_keywords)

    @staticmethod
    def extract_master_fund_name(fund_profile: Dict[str, Any]) -> Optional[str]:
        """Extract the master fund name from a fund profile."""
        master = fund_profile.get("feederfund_master_fund", "")
        if master and str(master).strip():
            return str(master).strip()
        return None


# ─── Well-known Master Fund → Ticker mappings ──────────────────────
# This is a curated mapping for popular master funds used by Thai feeder funds.
# Format: lowercase partial match → yfinance ticker
MASTER_FUND_TICKER_MAP = {
    # US Equity
    "ishares core s&p 500": "IVV",
    "vanguard s&p 500": "VOO",
    "spdr s&p 500": "SPY",
    "ishares msci usa": "EUSA",
    
    # Global Equity
    "ishares msci world": "URTH",
    "ishares msci acwi": "ACWI",
    "vanguard total world": "VT",
    "vanguard ftse all-world": "VT",
    
    # Tech / Nasdaq
    "invesco qqq": "QQQ",
    "invesco nasdaq 100": "QQQM",
    "ishares nasdaq 100": "QQQ",
    
    # China
    "ishares china": "MCHI",
    "ishares msci china": "MCHI",
    "xtrackers msci china": "CN",
    "hang seng china enterprises index": "2828.HK",
    "invesco china technology": "CQQQ",
    "chinaamc csi 300 index": "3188.HK",
    
    # Vietnam
    "vaneck vietnam": "VNM",
    "xtrackers ftse vietnam": "VNM",
    
    # India
    "ishares msci india": "INDA",
    "ishares india 50": "INDY",
    
    # Korea
    "msci korea index": "EWY",
    
    # Japan
    "ishares msci japan": "EWJ",
    "next funds nikkei 225": "1321.T",
    "nikkei 225 exchange traded fund": "1321.T",
    "ishares core nikkei 225": "1329.T",
    
    # Europe & Germany
    "ishares core msci europe": "IEUR",
    "ishares msci europe": "IEUR",
    "ishares stoxx europe 600": "EXSA.DE",
    "dax ucits etf": "XDAX.DE",
    
    # Fixed Income
    "pimco gis income": "PONAX",
    "pimco income": "PONAX",
    "jpmorgan income": "JGIAX",
    "templeton global bond": "TPINX",
    "ishares core u.s. aggregate bond": "AGG",
    "us aggregate bond": "AGG",
    
    # Gold / Commodities / Oil
    "spdr gold": "GLD",
    "ishares gold": "IAU",
    "wisdomtree physical gold": "SGOL",
    "invesco db oil": "DBO",
    "united states oil": "USO",
    
    # Real Estate
    "ishares global reit": "REET",
    
    # Healthcare
    "ishares healthcare": "IYH",
    "health sciences": "XLV",
    "global life sciences": "JNGLX",
    
    # Technology / Innovation
    "ishares global tech": "IXN",
    "fidelity global technology": "FTEKX",
    "artificial intelligence & big data": "XAIX.DE",
    
    # Mixed / Multi-Asset / Smart Beta
    "blackrock global allocation": "MDLOX",
    "jpmorgan multi-income": "JMUAX",
    "global select equity": "JGLO",
    "msci world quality factor": "QUAL",
    "us growth": "JIGRX",
}


def map_master_fund_to_ticker(master_fund_name: str) -> Optional[str]:
    """
    Attempt to map a master fund name to a yfinance ticker.
    
    Uses a curated mapping table with fuzzy matching.
    Returns None if no match is found.
    """
    if not master_fund_name:
        return None

    # Remove trademark symbols and clean up name for better fuzzy matching
    name_lower = master_fund_name.lower().replace("®", "").replace("™", "").strip()

    # Direct lookup in curated map
    for key, ticker in MASTER_FUND_TICKER_MAP.items():
        if key in name_lower:
            return ticker

    return None


# Module-level singleton
sec_service = SECService()
