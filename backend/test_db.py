from services.db_service import db_service

print("Testing get_trending_funds...")
try:
    res = db_service.get_trending_funds(5)
    print("Result:", res)
except Exception as e:
    print("Exception:", e)
