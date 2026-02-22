"""
SEC Data Import Script
Bulk import Thai mutual fund data from SEC Open Data API into Supabase.

Usage:
    python -m scripts.sec_import --action list_feeders --limit 10
    python -m scripts.sec_import --action sync_all
    python -m scripts.sec_import --action import_profiles --max-pages 5
"""

import argparse
import sys
import os
import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.sec_service import sec_service, SECService, map_master_fund_to_ticker
from services.sec_db_service import sec_db_service


def import_profiles(max_pages: int = None, dry_run: bool = False):
    """
    Import all fund profiles from SEC API into Supabase.
    """
    print("=" * 60)
    print("📥 Importing Fund Profiles from SEC Open Data API")
    print("=" * 60)

    funds = sec_service.get_all_fund_profiles(max_pages=max_pages)
    print(f"\nFound {len(funds)} funds total.")

    feeder_count = 0
    imported_count = 0

    for i, fund in enumerate(funds):
        proj_id = fund.get("proj_id", "")
        name_th = fund.get("proj_name_th", "")
        name_en = fund.get("proj_name_en", "")
        is_feeder = SECService.is_feeder_fund(fund)
        master_fund = SECService.extract_master_fund_name(fund)

        if is_feeder:
            feeder_count += 1
            ticker = map_master_fund_to_ticker(master_fund) if master_fund else None

            if dry_run:
                status = f"→ {ticker}" if ticker else "⚠ NO TICKER MATCH"
                print(f"  [{i+1}] {name_en or name_th}")
                print(f"       Master: {master_fund} {status}")
            else:
                # Prepare record for DB
                record = {
                    "proj_id": proj_id,
                    "proj_name_th": name_th,
                    "proj_name_en": name_en,
                    "proj_abbr_name": fund.get("proj_abbr_name", ""),
                    "amc_name_th": fund.get("comp_name_th", ""),
                    "amc_name_en": fund.get("comp_name_en", ""),
                    "fund_type": fund.get("policy_desc", ""),
                    "policy_desc": fund.get("investment_policy_desc", ""),
                    "is_feeder_fund": is_feeder,
                    "feederfund_master_fund": master_fund,
                    "feederfund_country": fund.get("feederfund_country", ""),
                    "master_fund_ticker": ticker,
                    "risk_level": fund.get("risk_spectrum", ""),
                    "updated_at": datetime.datetime.now(
                        datetime.timezone.utc
                    ).isoformat(),
                }
                sec_db_service.upsert_thai_fund(record)
                imported_count += 1

                # Also save feeder mapping if applicable
                if master_fund:
                    mapping = {
                        "thai_fund_proj_id": proj_id,
                        "master_fund_name": master_fund,
                        "master_fund_ticker": ticker,
                        "master_fund_isin": fund.get("feederfund_isin", ""),
                        "confidence": "auto" if ticker else "unmapped",
                    }
                    sec_db_service.upsert_feeder_mapping(mapping)

        elif not dry_run:
            # Save non-feeder funds too
            record = {
                "proj_id": proj_id,
                "proj_name_th": name_th,
                "proj_name_en": name_en,
                "proj_abbr_name": fund.get("proj_abbr_name", ""),
                "amc_name_th": fund.get("comp_name_th", ""),
                "amc_name_en": fund.get("comp_name_en", ""),
                "fund_type": fund.get("policy_desc", ""),
                "policy_desc": fund.get("investment_policy_desc", ""),
                "is_feeder_fund": False,
                "risk_level": fund.get("risk_spectrum", ""),
                "updated_at": datetime.datetime.now(
                    datetime.timezone.utc
                ).isoformat(),
            }
            sec_db_service.upsert_thai_fund(record)
            imported_count += 1

        # Progress indicator
        if (i + 1) % 50 == 0:
            print(f"  ... processed {i + 1}/{len(funds)} funds")

    print(f"\n{'─' * 40}")
    print(f"✅ Done! Processed {len(funds)} funds")
    print(f"   Feeder funds: {feeder_count}")
    if not dry_run:
        print(f"   Imported to DB: {imported_count}")


def list_feeders(limit: int = 20):
    """
    List feeder funds from the SEC API (dry run/preview).
    """
    print("=" * 60)
    print("🔍 Listing Feeder Funds (Preview)")
    print("=" * 60)

    # Fetch first few pages
    max_pages = max(1, limit // 20 + 1)
    funds = sec_service.get_all_fund_profiles(max_pages=max_pages)

    feeder_funds = [f for f in funds if SECService.is_feeder_fund(f)]
    print(f"\nFound {len(feeder_funds)} feeder funds (from {len(funds)} total)\n")

    for i, fund in enumerate(feeder_funds[:limit]):
        name = fund.get("proj_name_en", fund.get("proj_name_th", "?"))
        master = SECService.extract_master_fund_name(fund)
        country = fund.get("feederfund_country", "?")
        ticker = map_master_fund_to_ticker(master) if master else None

        print(f"  {i+1}. {name}")
        print(f"     proj_id: {fund.get('proj_id', '?')}")
        print(f"     Master Fund: {master or 'N/A'}")
        print(f"     Country: {country}")
        print(f"     yfinance Ticker: {ticker or '⚠ Not mapped'}")
        print()


def import_holdings(proj_id: str = None, period: str = None):
    """
    Import quarterly portfolio holdings for a specific fund or all feeder funds.
    """
    print("=" * 60)
    print("📊 Importing Fund Holdings")
    print("=" * 60)

    if proj_id:
        # Import for a single fund
        holdings = sec_service.get_quarterly_portfolio(proj_id, start_period=period)
        print(f"  Found {len(holdings)} holdings for {proj_id}")
        for h in holdings:
            record = {
                "thai_fund_proj_id": proj_id,
                "period": h.get("period", period or ""),
                "issuer": h.get("issuer", ""),
                "issue_code": h.get("issue_code", ""),
                "isin_code": h.get("isin_code", ""),
                "asset_type": h.get("asset_type", ""),
                "value": h.get("assetliab_value", 0),
                "percent_nav": h.get("percent_nav", 0),
            }
            sec_db_service.upsert_thai_fund_holding(record)
        print(f"  ✅ Imported {len(holdings)} holdings")
    else:
        print("  Specify --proj-id to import holdings for a specific fund.")


def test_connection():
    """Test SEC API connectivity."""
    print("=" * 60)
    print("🔌 Testing SEC API Connection")
    print("=" * 60)

    if not sec_service.api_key:
        print("  ❌ SEC_API_KEY not set in .env!")
        print("  Please register at https://secopendata.sec.or.th and add your key.")
        return

    try:
        data = sec_service.get_fund_profiles(page=1)
        if data:
            items = data.get("items", []) if isinstance(data, dict) else data
            total = data.get("total_items", "?") if isinstance(data, dict) else "?"
            print(f"  ✅ Connection successful!")
            print(f"  Found {len(items)} funds on page 1 ({total} total)")
            if items:
                first = items[0]
                print(f"  First fund: {first.get('proj_name_en', first.get('proj_name_th', '?'))}")
                print(f"  proj_id: {first.get('proj_id', '?')}")
        else:
            print("  ⚠ Connected but no data returned")
    except Exception as e:
        print(f"  ❌ Connection failed: {e}")


def main():
    parser = argparse.ArgumentParser(description="SEC Open Data Import Tool")
    parser.add_argument(
        "--action",
        choices=["test", "list_feeders", "import_profiles", "import_holdings", "sync_all"],
        required=True,
        help="Action to perform",
    )
    parser.add_argument("--limit", type=int, default=20, help="Limit results")
    parser.add_argument("--max-pages", type=int, default=None, help="Max pages to fetch")
    parser.add_argument("--proj-id", type=str, default=None, help="Fund project ID")
    parser.add_argument("--period", type=str, default=None, help="Period in YYYYMM format")
    parser.add_argument("--dry-run", action="store_true", help="Preview without saving to DB")

    args = parser.parse_args()

    if args.action == "test":
        test_connection()
    elif args.action == "list_feeders":
        list_feeders(limit=args.limit)
    elif args.action == "import_profiles":
        import_profiles(max_pages=args.max_pages, dry_run=args.dry_run)
    elif args.action == "import_holdings":
        import_holdings(proj_id=args.proj_id, period=args.period)
    elif args.action == "sync_all":
        print("🚀 Starting full sync...\n")
        import_profiles(max_pages=args.max_pages, dry_run=args.dry_run)
        print()
        print("✅ Full sync complete!")


if __name__ == "__main__":
    main()
