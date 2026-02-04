import type {
  ApiResponse,
  LoginResponse,
  WalletSummaryResponse,
  ExchangeRateResponse,
  OrderQuoteRequest,
  OrderQuoteResponse,
  OrderRequest,
  OrderResponse,
} from "../types/api";
import { isApiError } from "../types/error";

const API_BASE = "/api";

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("accessToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (isApiError(data) && data.code === "UNAUTHORIZED") {
      localStorage.removeItem("accessToken");
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    throw data;
  }

  return data;
}

export async function login(
  email: string
): Promise<ApiResponse<LoginResponse>> {
  const response = await fetch(
    `${API_BASE}/auth/login?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function getWallets(): Promise<
  ApiResponse<WalletSummaryResponse>
> {
  return fetchApi<WalletSummaryResponse>("/wallets");
}

export async function getExchangeRates(): Promise<
  ApiResponse<ExchangeRateResponse[]>
> {
  return fetchApi<ExchangeRateResponse[]>("/exchange-rates/latest");
}

export async function getOrderQuote(
  params: OrderQuoteRequest
): Promise<ApiResponse<OrderQuoteResponse>> {
  const query = new URLSearchParams({
    fromCurrency: params.fromCurrency,
    toCurrency: params.toCurrency,
    forexAmount: params.forexAmount.toString(),
  });

  return fetchApi<OrderQuoteResponse>(`/orders/quote?${query}`);
}

export async function createOrder(
  order: OrderRequest
): Promise<ApiResponse<null>> {
  return fetchApi<null>("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export async function getOrders(): Promise<ApiResponse<OrderResponse[]>> {
  return fetchApi<OrderResponse[]>("/orders");
}
