export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface LoginResponse {
  memberId: number;
  token: string;
}

export interface WalletResponse {
  walletId: number;
  currency: "KRW" | "USD" | "JPY";
  balance: number;
}

export interface WalletSummaryResponse {
  totalKrwBalance: number;
  wallets: WalletResponse[];
}

export interface ExchangeRateResponse {
  exchangeRateId: number;
  currency: "USD" | "JPY";
  rate: number;
  changePercentage: number;
  applyDateTime: string;
}

export interface OrderQuoteRequest {
  fromCurrency: "KRW" | "USD" | "JPY";
  toCurrency: "KRW" | "USD" | "JPY";
  forexAmount: number;
}

export interface OrderQuoteResponse {
  krwAmount: number;
  appliedRate: number;
}

export interface OrderRequest {
  exchangeRateId: number;
  fromCurrency: "KRW" | "USD" | "JPY";
  toCurrency: "KRW" | "USD" | "JPY";
  forexAmount: number;
}

export interface OrderResponse {
  orderId: number;
  fromCurrency: "KRW" | "USD" | "JPY";
  fromAmount: number;
  toCurrency: "KRW" | "USD" | "JPY";
  toAmount: number;
  appliedRate: number;
  orderedAt: string;
}
