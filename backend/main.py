from flask import Flask, jsonify, request
from flask_cors import CORS
from services.yfinance_service import get_fund_data
from services.db_service import db_service
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
        results = db_service.search_funds(query, limit)
        return jsonify({"results": results})
    except Exception as e:
        print(f"Error searching funds: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
