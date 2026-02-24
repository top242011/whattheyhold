"""
SEC DB Service
Handles Supabase CRUD operations for Thai fund data (from SEC Open Data API).
"""

import os
import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")


class SECDBService:
    """Database operations for Thai fund data."""

    def __init__(self):
        if url and key:
            self.supabase: Client = create_client(url, key)
            print("SEC DB Service: Supabase client initialized")
        else:
            self.supabase = None
            print("SEC DB Service: Missing Supabase credentials")

    # ─── Thai Funds ─────────────────────────────────────────────────

    def upsert_thai_fund(self, record: Dict[str, Any]) -> bool:
        """Insert or update a Thai fund record."""
        if not self.supabase:
            return False
        try:
            self.supabase.table("thai_funds").upsert(
                record, on_conflict="proj_id"
            ).execute()
            return True
        except Exception as e:
            print(f"Error upserting thai_fund {record.get('proj_id')}: {e}")
            return False

    def get_thai_fund(self, proj_id: str) -> Optional[Dict[str, Any]]:
        """Get a Thai fund by project ID."""
        if not self.supabase:
            return None
        try:
            result = (
                self.supabase.table("thai_funds")
                .select("*")
                .eq("proj_id", proj_id)
                .execute()
            )
            if result.data and len(result.data) > 0:
                # Increment view count asynchronously
                try:
                    self.supabase.rpc('increment_thai_fund_view', {'p_proj_id': proj_id}).execute()
                except Exception as e:
                    print(f"Failed to increment view for thai fund {proj_id}: {e}")
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error getting thai_fund {proj_id}: {e}")
            return None

    def get_feeder_funds(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all feeder funds."""
        if not self.supabase:
            return []
        try:
            result = (
                self.supabase.table("thai_funds")
                .select("*")
                .eq("is_feeder_fund", True)
                .order("proj_name_en")
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"Error getting feeder funds: {e}")
            return []

    def search_thai_funds(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search Thai funds by name or abbreviation."""
        if not self.supabase or not query:
            return []
        try:
            result = (
                self.supabase.table("thai_funds")
                .select("proj_id, proj_name_th, proj_name_en, proj_abbr_name, "
                        "is_feeder_fund, feederfund_master_fund, master_fund_ticker, "
                        "amc_name_en, fund_type, risk_level")
                .or_(
                    f"proj_name_en.ilike.%{query}%,"
                    f"proj_name_th.ilike.%{query}%,"
                    f"proj_abbr_name.ilike.%{query}%,"
                    f"proj_id.ilike.%{query}%,"
                    f"amc_name_en.ilike.%{query}%"
                )
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            print(f"Error searching thai funds: {e}")
            return []

    # ─── AMC List ─────────────────────────────────────────────────

    def get_distinct_amcs(self) -> List[str]:
        """Get distinct AMC names from Thai funds."""
        if not self.supabase:
            return []
        try:
            result = (
                self.supabase.table("thai_funds")
                .select("amc_name_en")
                .not_.is_("amc_name_en", "null")
                .order("amc_name_en")
                .execute()
            )
            # Deduplicate
            seen = set()
            amcs = []
            for row in (result.data or []):
                name = row.get("amc_name_en", "").strip()
                if name and name not in seen:
                    seen.add(name)
                    amcs.append(name)
            return amcs
        except Exception as e:
            print(f"Error getting distinct AMCs: {e}")
            return []

    # ─── Feeder Master Mapping ──────────────────────────────────────

    def upsert_feeder_mapping(self, record: Dict[str, Any]) -> bool:
        """Insert or update a feeder-to-master fund mapping."""
        if not self.supabase:
            return False
        try:
            # Delete existing record first (no unique constraint on table)
            proj_id = record.get("thai_fund_proj_id")
            if proj_id:
                self.supabase.table("feeder_master_mapping").delete().eq(
                    "thai_fund_proj_id", proj_id
                ).execute()
            # Then insert new
            self.supabase.table("feeder_master_mapping").insert(record).execute()
            return True
        except Exception as e:
            print(f"Error upserting feeder mapping: {e}")
            return False

    def get_feeder_mapping(self, proj_id: str) -> Optional[Dict[str, Any]]:
        """Get the feeder-to-master mapping for a fund."""
        if not self.supabase:
            return None
        try:
            result = (
                self.supabase.table("feeder_master_mapping")
                .select("*")
                .eq("thai_fund_proj_id", proj_id)
                .execute()
            )
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error getting feeder mapping {proj_id}: {e}")
            return None

    # ─── Thai Fund Holdings ─────────────────────────────────────────

    def upsert_thai_fund_holding(self, record: Dict[str, Any]) -> bool:
        """Insert a Thai fund quarterly holding record."""
        if not self.supabase:
            return False
        try:
            self.supabase.table("thai_fund_holdings").insert(record).execute()
            return True
        except Exception as e:
            print(f"Error inserting thai_fund_holding: {e}")
            return False

    def get_thai_fund_holdings(
        self, proj_id: str, period: str = None
    ) -> List[Dict[str, Any]]:
        """Get holdings for a Thai fund, optionally filtered by period."""
        if not self.supabase:
            return []
        try:
            query = (
                self.supabase.table("thai_fund_holdings")
                .select("*")
                .eq("thai_fund_proj_id", proj_id)
                .order("percent_nav", desc=True)
            )
            if period:
                query = query.eq("period", period)
            result = query.limit(100).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting thai_fund_holdings: {e}")
            return []


# Module-level singleton
sec_db_service = SECDBService()
