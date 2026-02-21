# Simple mapper for MVP. In reality, this would be a database or more comprehensive lookup.
# Maps suffix to ISO 3166-1 numeric code (compatible with world-atlas topojson)

SUFFIX_TO_COUNTRY = {
    "US": "840", "USA": "840", "": "840", # Default to US
    "JPN": "392", ".T": "392", # Tokyo
    "GBR": "826", ".L": "826", # London
    "CAN": "124", ".TO": "124", # Toronto
    "FRA": "250", ".PA": "250", # Paris
    "DEU": "276", ".DE": "276", # Xetra
    "CHE": "756", ".SW": "756", # Swiss
    "AUS": "036", ".AX": "036", # Australia
    "CHN": "156", ".SS": "156", ".HK": "156", # China/Hong Kong
    "IND": "356", ".NS": "356", # NSE India
    "TWN": "158", ".TW": "158", # Taiwan
    "KOR": "410", ".KS": "410", # Korea
    "BRA": "076", ".SA": "076", # Sao Paulo
}

def get_country_code(ticker: str) -> str:
    """
    Deduces country code from ticker suffix.
    e.g. "NESN.SW" -> "756" (Switzerland)
    e.g. "AAPL" -> "840" (USA)
    """
    parts = ticker.split(".")
    if len(parts) > 1:
        suffix = "." + parts[-1]
        return SUFFIX_TO_COUNTRY.get(suffix, "840") # Default to US if unknown suffix for now
    
    return "840" # Default to US for no suffix
