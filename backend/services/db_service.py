import os
import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from models.schemas import FundResponse, FundInfo, Holding, CountryWeight, SectorWeight
from typing import Optional, List
from dataclasses import asdict

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

class DBService:
    def __init__(self):
        if url and key:
            self.supabase: Client = create_client(url, key)
            print("Supabase client initialized")
        else:
            self.supabase = None
            print("Supabase credentials not found, DB disabled")

    def get_fund(self, ticker: str) -> Optional[FundResponse]:
        if not self.supabase:
            return None
            
        try:
            # 1. Get Fund
            response = self.supabase.table("funds").select("*").eq("ticker", ticker).execute()
            if not response.data:
                return None
            
            fund_data = response.data[0]
            fund_id = fund_data['id']
            
            # 2. Get Related Data
            holdings_res = self.supabase.table("holdings").select("*").eq("fund_id", fund_id).execute()
            country_res = self.supabase.table("country_weights").select("*").eq("fund_id", fund_id).execute()
            sector_res = self.supabase.table("sector_weights").select("*").eq("fund_id", fund_id).execute()
            
            # 3. Construct objects
            fund = FundInfo(
                ticker=fund_data['ticker'],
                name=fund_data['name'],
                price=float(fund_data['price']) if fund_data['price'] else None,
                currency=fund_data['currency']
            )
            
            holdings = [
                Holding(ticker=h['ticker'], name=h['name'], pct=float(h['pct'])) 
                for h in holdings_res.data
            ]
            
            country_weights = [
                CountryWeight(country_code=c['country_code'], weight_pct=float(c['weight_pct']))
                for c in country_res.data
            ]
            
            sector_weights = [
                SectorWeight(sector=s['sector'], weight_pct=float(s['weight_pct']))
                for s in sector_res.data
            ]
            
            return FundResponse(
                fund=fund,
                holdings=holdings,
                country_weights=country_weights,
                sector_weights=sector_weights,
                last_updated=fund_data.get('updated_at')
            )

        except Exception as e:
            print(f"Error fetching from DB: {e}")
            return None
            
    def is_cache_fresh(self, last_updated_iso: str, max_age_hours: int = 24) -> bool:
        """Check if the cache is fresh (younger than max_age_hours)."""
        if not last_updated_iso:
            return False
            
        try:
            # Parse ISO timestamp (handle Z for UTC)
            last_updated = datetime.datetime.fromisoformat(last_updated_iso.replace('Z', '+00:00'))
            
            # Ensure timezone awareness for comparison
            if last_updated.tzinfo is None:
                last_updated = last_updated.replace(tzinfo=datetime.timezone.utc)
                
            now = datetime.datetime.now(datetime.timezone.utc)
            diff = now - last_updated
            
            is_fresh = diff.total_seconds() < (max_age_hours * 3600)
            print(f"Cache check: age={diff}, fresh={is_fresh}")
            return is_fresh
        except Exception as e:
            print(f"Error checking cache freshness: {e}")
            return False

    def upsert_fund(self, data: FundResponse):
        if not self.supabase:
            return
            
        try:
            print(f"Upserting {data.fund.ticker} to DB...")
            
            # 1. Upsert Fund (using ticker as unique key if constraint exists, otherwise we need logic)
            # The schema has ticker text unique.
            fund_payload = {
                "ticker": data.fund.ticker,
                "name": data.fund.name,
                "price": data.fund.price,
                "currency": data.fund.currency,
                "updated_at": datetime.datetime.now().isoformat()
            }
            
            # Perform Upsert on funds
            res = self.supabase.table("funds").upsert(fund_payload, on_conflict="ticker").execute()
            if not res.data:
                print("Failed to upsert fund")
                return
                
            fund_id = res.data[0]['id']
            
            # 2. Clear old relations (Cascade delete is set on FKs, but we need to delete children to replace)
            # Strategy: Delete all holdings/weights for this fund_id and re-insert
            self.supabase.table("holdings").delete().eq("fund_id", fund_id).execute()
            self.supabase.table("country_weights").delete().eq("fund_id", fund_id).execute()
            self.supabase.table("sector_weights").delete().eq("fund_id", fund_id).execute()
            
            # 3. Insert new relations
            if data.holdings:
                h_payload = [
                    {"fund_id": fund_id, "ticker": h.ticker, "name": h.name, "pct": h.pct}
                    for h in data.holdings
                ]
                self.supabase.table("holdings").insert(h_payload).execute()
                
            if data.country_weights:
                c_payload = [
                    {"fund_id": fund_id, "country_code": c.country_code, "weight_pct": c.weight_pct}
                    for c in data.country_weights
                ]
                self.supabase.table("country_weights").insert(c_payload).execute()

            if data.sector_weights:
                s_payload = [
                    {"fund_id": fund_id, "sector": s.sector, "weight_pct": s.weight_pct}
                    for s in data.sector_weights
                ]
                self.supabase.table("sector_weights").insert(s_payload).execute()
                
            print(f"Successfully saved {data.fund.ticker} to Supabase")

        except Exception as e:
            print(f"Error saving to DB: {e}")

    def screen_funds(self, holding_ticker: str, min_weight: float) -> List[dict]:
        if not self.supabase:
            return []
            
        try:
            holding_ticker = holding_ticker.upper()
            # Perform join between holdings and funds table using PostgREST syntax
            response = self.supabase.table("holdings") \
                .select("pct, funds!inner(ticker, name)") \
                .eq("ticker", holding_ticker) \
                .gte("pct", min_weight) \
                .order("pct", desc=True) \
                .execute()
            
            if not response.data:
                return []
                
            results = []
            for item in response.data:
                fund_info = item.get("funds", {})
                results.append({
                    "fund_ticker": fund_info.get("ticker"),
                    "fund_name": fund_info.get("name"),
                    "holding_ticker": holding_ticker,
                    "weight_pct": item.get("pct")
                })
            return results
                
        except Exception as e:
            print(f"Error screening funds: {e}")
            return []

    def get_trending_funds(self, limit: int = 5) -> List[dict]:
        if not self.supabase:
            return []
            
        try:
            # For this MVP, let's just fetch the 5 most recently updated funds in the DB
            # We can expand this later to use view counts or user watchlist counts
            response = self.supabase.table("funds") \
                .select("ticker, name, price, change_pct") \
                .order("updated_at", desc=True) \
                .limit(limit) \
                .execute()
                
            return response.data or []
        except Exception as e:
            print(f"Error fetching trending funds: {e}")
            return []

    def search_funds(self, query: str, limit: int = 5) -> List[dict]:
        if not self.supabase or not query:
            return []
            
        try:
            query = query.upper()
            # Basic ilike search on ticker or name
            response = self.supabase.table("funds") \
                .select("ticker, name") \
                .ilike("ticker", f"%{query}%") \
                .limit(limit) \
                .execute()
                
            return response.data or []
        except Exception as e:
            print(f"Error searching funds: {e}")
            return []

db_service = DBService()
