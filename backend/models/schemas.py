from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Holding:
    ticker: str
    name: str
    pct: float

@dataclass
class CountryWeight:
    country_code: str  # ISO 3166-1 alpha-3 or numeric code
    weight_pct: float

@dataclass
class FundInfo:
    ticker: str
    name: str
    price: Optional[float] = None
    currency: Optional[str] = "USD"

@dataclass
class SectorWeight:
    sector: str
    weight_pct: float

@dataclass
class FundResponse:
    fund: FundInfo
    holdings: List[Holding]
    country_weights: List[CountryWeight]
    sector_weights: List[SectorWeight]
    last_updated: Optional[str] = None

