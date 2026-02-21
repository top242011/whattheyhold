import os
import sys
import time

# Add backend dir to pythonpath so we can import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.yfinance_service import get_fund_data

# List of popular ETFs taking up the majority of queries
POPULAR_FUNDS = [
    "VOO", "QQQ", "VTI", "SCHD", "SPY", "IVV", "VUG", "IWM", "VNQ", "ARKK"
]

def seed_cache():
    print(f"Starting background cache refresh for {len(POPULAR_FUNDS)} funds...")
    success_count = 0
    fail_count = 0
    
    for ticker in POPULAR_FUNDS:
        print(f"[{time.strftime('%H:%M:%S')}] Updating {ticker}...")
        try:
            # get_fund_data handles the upsert to Supabase if fresh data is found
            # We use force_refresh=True to ensure we fetch new data regardless of cache
            get_fund_data(ticker, force_refresh=True)
            success_count += 1
            # Rate limit protection: sleep between requests
            time.sleep(3) 
        except Exception as e:
            print(f"Failed to update {ticker}: {e}")
            fail_count += 1
            
    print(f"Cache refresh complete! Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    seed_cache()
