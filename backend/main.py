from flask import Flask, jsonify, request
from flask_cors import CORS
from services.yfinance_service import get_fund_data
from services.db_service import db_service
from services.sec_service import sec_service, map_master_fund_to_ticker
from services.sec_db_service import sec_db_service
from dataclasses import asdict

app = Flask(__name__)
CORS(app)

@app.route("/")
def root():
    return jsonify({"message": "Welcome to WhatTheyHold API"})

@app.route("/health")
def health_check():
    return jsonify({"status": "ok"})

@app.route("/api/fund/<ticker>")
def get_fund(ticker):
    try:
        data = get_fund_data(ticker)
        if not data:
            return jsonify({"error": "Fund not found"}), 404
        
        # Serialize Dataclass to dict
        return jsonify(asdict(data))
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/screen")
def screen_funds():
    holding = request.args.get("holding", "").upper()
    min_weight = request.args.get("min_weight", type=float, default=0.0)
    
    if not holding:
        return jsonify({"error": "Missing 'holding' parameter"}), 400
        
    try:
        results = db_service.screen_funds(holding, min_weight)
        return jsonify({"results": results})
    except Exception as e:
        print(f"Error screening funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/trending")
def trending_funds():
    try:
        limit = request.args.get("limit", default=5, type=int)
        results = db_service.get_trending_funds(limit)
        return jsonify({"results": results})
    except Exception as e:
        print(f"Error fetching trending funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/search")
def search_funds():
    query = request.args.get("q", "")
    if not query:
        return jsonify({"results": []})
        
    try:
        limit = request.args.get("limit", default=5, type=int)
        
        # Search existing yfinance funds
        yf_results = db_service.search_funds(query, limit)
        
        # Also search Thai funds (SEC data)
        thai_results_raw = sec_db_service.search_thai_funds(query, limit)
        thai_results = []
        for tf in thai_results_raw:
            thai_results.append({
                "ticker": tf.get("proj_abbr_name") or tf.get("proj_id", ""),
                "name": tf.get("proj_name_en") or tf.get("proj_name_th", ""),
                "proj_id": tf.get("proj_id", ""),
                "source": "sec",
                "is_feeder_fund": tf.get("is_feeder_fund", False),
                "master_fund": tf.get("feederfund_master_fund"),
                "master_ticker": tf.get("master_fund_ticker"),
            })
        
        # Merge results: yfinance first, then Thai funds
        combined = yf_results + thai_results
        return jsonify({"results": combined[:limit * 2]})
    except Exception as e:
        print(f"Error searching funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# ─── Thai Fund Routes (SEC Open Data) ────────────────────────────

@app.route("/api/thai-funds/search")
def search_thai_funds():
    """Search Thai funds by name or project ID."""
    query = request.args.get("q", "")
    if not query:
        return jsonify({"results": []})
    try:
        limit = request.args.get("limit", default=10, type=int)
        results = sec_db_service.search_thai_funds(query, limit)
        return jsonify({"results": results})
    except Exception as e:
        print(f"Error searching Thai funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/thai-fund/<proj_id>")
def get_thai_fund(proj_id):
    """Get Thai fund info by SEC project ID."""
    try:
        fund = sec_db_service.get_thai_fund(proj_id)
        if not fund:
            return jsonify({"error": "Thai fund not found"}), 404
        return jsonify(fund)
    except Exception as e:
        print(f"Error fetching Thai fund {proj_id}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/thai-fund-info/<ticker>")
def get_thai_fund_by_ticker(ticker):
    """
    Get Thai fund info plus Top 5 Holdings (for non-feeder funds).
    Searches by proj_abbr_name or proj_id.
    """
    try:
        # 1. Find the fund in our DB
        results = sec_db_service.search_thai_funds(ticker, limit=1)
        if not results:
            return jsonify({"error": "Thai fund not found"}), 404
            
        fund = results[0]
        proj_id = fund.get("proj_id")
        
        # 2. Get Top 5 holdings from SEC API directly
        # Since this is a direct pass-through, we don't store top 5 in DB right now
        top5 = []
        if proj_id:
            raw_top5 = sec_service.get_top5_holdings(proj_id)
            if raw_top5:
                # The SEC API returns historical top 5 holdings. We only want the latest period.
                # Find the maximum date string in either end_date or last_upd_date
                latest_date = max(item.get("end_date", "") or item.get("start_date", "") for item in raw_top5)
                # Filter down to just the items that belong to the latest_date
                top5 = [item for item in raw_top5 if (item.get("end_date") == latest_date or item.get("start_date") == latest_date)]
                
                # Sort by asset_ratio descending
                top5 = sorted(top5, key=lambda x: x.get("asset_ratio", 0), reverse=True)
            
        return jsonify({
            "fund_info": fund,
            "top5_holdings": top5[:5]
        })
    except Exception as e:
        print(f"Error fetching Thai fund info for {ticker}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/thai-fund/<proj_id>/holdings")
def get_thai_fund_holdings(proj_id):
    """
    Two-layer holdings lookup:
    1. Find the Thai feeder fund's master fund ticker
    2. Fetch the master fund's underlying holdings via yfinance
    Returns combined data.
    """
    try:
        # Layer 1: Get Thai fund info
        fund = sec_db_service.get_thai_fund(proj_id)
        if not fund:
            return jsonify({"error": "Thai fund not found"}), 404

        master_ticker = fund.get("master_fund_ticker")
        if not master_ticker:
            # Try to get from feeder mapping table
            mapping = sec_db_service.get_feeder_mapping(proj_id)
            if mapping:
                master_ticker = mapping.get("master_fund_ticker")

        if not master_ticker:
            return jsonify({
                "thai_fund": fund,
                "master_fund": None,
                "holdings": [],
                "message": "Master fund ticker not mapped. Cannot fetch holdings."
            })

        # Layer 2: Fetch master fund holdings via yfinance
        master_data = get_fund_data(master_ticker)
        if not master_data:
            return jsonify({
                "thai_fund": fund,
                "master_fund": {"ticker": master_ticker},
                "holdings": [],
                "message": f"Could not fetch holdings for master fund {master_ticker}"
            })

        return jsonify({
            "thai_fund": fund,
            "master_fund": asdict(master_data.fund),
            "holdings": [asdict(h) for h in master_data.holdings],
            "country_weights": [asdict(c) for c in master_data.country_weights],
            "sector_weights": [asdict(s) for s in master_data.sector_weights],
            "last_updated": master_data.last_updated,
        })
    except Exception as e:
        print(f"Error fetching Thai fund holdings {proj_id}: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/thai-funds/feeders")
def list_feeder_funds():
    """List all Thai feeder funds with their master fund mappings."""
    try:
        limit = request.args.get("limit", default=50, type=int)
        results = sec_db_service.get_feeder_funds(limit)
        return jsonify({"results": results, "count": len(results)})
    except Exception as e:
        print(f"Error listing feeder funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
