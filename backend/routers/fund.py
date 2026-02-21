from fastapi import APIRouter, HTTPException
from backend.services.yfinance_service import get_fund_data
from backend.models.schemas import FundResponse

router = APIRouter(prefix="/api/fund", tags=["fund"])

@router.get("/{ticker}", response_model=FundResponse)
async def get_fund(ticker: str):
    data = get_fund_data(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Fund not found")
    return data
