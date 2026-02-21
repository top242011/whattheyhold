export interface Holding {
    ticker: string;
    name: string;
    pct: number;
}

export interface CountryWeight {
    country_code: string;
    weight_pct: number;
}

export interface SectorWeight {
    sector: string;
    weight_pct: number;
}

export interface FundInfo {
    ticker: string;
    name: string;
    price?: number;
    currency?: string;
    type?: string;       // "ETF" | "Mutual Fund" | etc.
    change_pct?: number; // daily % change
}

export interface FundResponse {
    fund: FundInfo;
    holdings: Holding[];
    country_weights: CountryWeight[];
    sector_weights: SectorWeight[];
    last_updated?: string;
}
