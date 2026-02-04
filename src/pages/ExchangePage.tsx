import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWallets,
  getExchangeRates,
  getOrderQuote,
  createOrder,
} from "../services/api";
import {
  getErrorMessage,
  isExchangeRateMismatchError,
  isInsufficientBalanceError,
} from "../utils/errorHandler";
import { useToastStore } from "../store/useToastStore";
import "../styles/Exchange.scss";

type Currency = "KRW" | "USD" | "JPY";
type TradeType = "buy" | "sell";

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  JPY: "🇯🇵",
  KRW: "🇰🇷",
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: "미국 달러",
  JPY: "일본 엔화",
  KRW: "한국 원화",
};

const ExchangePage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "JPY">(
    "USD"
  );
  const [tradeType, setTradeType] = useState<TradeType>("buy");
  const [amount, setAmount] = useState("");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState("");
  const [error, setError] = useState("");

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const response = await getWallets();
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: exchangeRates = [], isLoading: ratesLoading } = useQuery({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      const response = await getExchangeRates();
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: ["quote", debouncedAmount, selectedCurrency, tradeType],
    queryFn: async () => {
      const fromCurrency: Currency =
        tradeType === "buy" ? "KRW" : selectedCurrency;
      const toCurrency: Currency =
        tradeType === "buy" ? selectedCurrency : "KRW";

      const response = await getOrderQuote({
        fromCurrency,
        toCurrency,
        forexAmount: parseFloat(debouncedAmount),
      });
      return response.data;
    },
    enabled: !!debouncedAmount && parseFloat(debouncedAmount) > 0,
  });

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      showToast("환전이 완료되었습니다!", "success");
      setAmount("");
      setDebouncedAmount("");
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: async (err: unknown) => {
      if (isExchangeRateMismatchError(err)) {
        await queryClient.invalidateQueries({ queryKey: ["exchangeRates"] });
        await queryClient.invalidateQueries({ queryKey: ["quote"] });
        showToast(
          "환율이 변경되었습니다. 금액을 확인 후 다시 시도해주세요.",
          "error"
        );
      } else if (isInsufficientBalanceError(err)) {
        showToast("지갑 잔액이 부족합니다.", "error");
      } else {
        showToast(getErrorMessage(err), "error");
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 500);
    return () => clearTimeout(timer);
  }, [amount]);

  useEffect(() => {
    setError("");
  }, [amount, selectedCurrency, tradeType]);

  const handleExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || parseFloat(amount) <= 0) {
      setError("환전할 금액을 입력해주세요.");
      return;
    }

    const rate = exchangeRates.find((r) => r.currency === selectedCurrency);
    if (!rate) {
      setError("환율 정보를 찾을 수 없습니다.");
      return;
    }

    const fromCurrency: Currency =
      tradeType === "buy" ? "KRW" : selectedCurrency;
    const toCurrency: Currency = tradeType === "buy" ? selectedCurrency : "KRW";

    orderMutation.mutate({
      exchangeRateId: rate.exchangeRateId,
      fromCurrency,
      toCurrency,
      forexAmount: parseFloat(amount),
    });
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatCurrencyValue = (value: number, currency: string) => {
    if (currency === "KRW") return `₩ ${formatNumber(value, 0)}`;
    if (currency === "USD") return `$ ${formatNumber(value, 2)}`;
    if (currency === "JPY") return `¥ ${formatNumber(value, 0)}`;
    return formatNumber(value);
  };

  const currentRate = exchangeRates.find(
    (r) => r.currency === selectedCurrency
  );

  return (
    <div className="exchange-page">
      <div className="section-header">
        <h1 className="section-title">환율 정보</h1>
        <p className="section-subtitle">
          실시간 환율을 확인하고 간편하게 환전하세요.
        </p>
      </div>

      <div className="exchange-content">
        <div className="exchange-left">
          <div className="rate-cards">
            {ratesLoading ? (
              <div className="loading-spinner" />
            ) : (
              exchangeRates.map((rate) => (
                <div key={rate.exchangeRateId} className="rate-card">
                  <div className="rate-card-header">
                    <span className="rate-card-currency">{rate.currency}</span>
                    <span className="rate-card-name">
                      {CURRENCY_NAMES[rate.currency]}
                    </span>
                  </div>
                  <div className="rate-card-value">
                    {formatNumber(rate.rate, 2)} KRW
                  </div>
                  <div
                    className={`rate-card-change ${
                      rate.changePercentage >= 0 ? "up" : "down"
                    }`}
                  >
                    {rate.changePercentage >= 0 ? "▲" : "▼"}{" "}
                    {rate.changePercentage >= 0 ? "+" : ""}
                    {rate.changePercentage.toFixed(1)}%
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="wallet-card">
            <h2 className="wallet-card-title">내 지갑</h2>
            {walletsLoading ? (
              <div className="loading-spinner" />
            ) : (
              <div className="wallet-list">
                {wallets?.wallets.map((wallet) => (
                  <div key={wallet.walletId} className="wallet-item">
                    <span className="wallet-currency">{wallet.currency}</span>
                    <span className="wallet-balance">
                      {formatCurrencyValue(wallet.balance, wallet.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="wallet-total">
              <span className="wallet-total-label">총 보유 자산</span>
              <span className="wallet-total-value">
                ₩ {formatNumber(wallets?.totalKrwBalance ?? 0, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="exchange-right">
          <div className="exchange-form-card">
            <div className="currency-selector">
              <button
                type="button"
                className="currency-selector-btn"
                onClick={() =>
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)
                }
              >
                <span className="currency-flag">
                  {CURRENCY_FLAGS[selectedCurrency]}
                </span>
                <span>{selectedCurrency} 환전하기</span>
                <span className="dropdown-arrow">
                  {isCurrencyDropdownOpen ? "▲" : "▼"}
                </span>
              </button>
              {isCurrencyDropdownOpen && (
                <div className="currency-dropdown">
                  <button
                    type="button"
                    className={`currency-option ${
                      selectedCurrency === "USD" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedCurrency("USD");
                      setIsCurrencyDropdownOpen(false);
                    }}
                  >
                    <span className="currency-flag">{CURRENCY_FLAGS.USD}</span>
                    <span>미국 USD</span>
                  </button>
                  <button
                    type="button"
                    className={`currency-option ${
                      selectedCurrency === "JPY" ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedCurrency("JPY");
                      setIsCurrencyDropdownOpen(false);
                    }}
                  >
                    <span className="currency-flag">{CURRENCY_FLAGS.JPY}</span>
                    <span>일본 JPY</span>
                  </button>
                </div>
              )}
            </div>

            <div className="trade-toggle">
              <button
                type="button"
                className={`trade-toggle-btn buy ${
                  tradeType === "buy" ? "active" : ""
                }`}
                onClick={() => setTradeType("buy")}
              >
                살래요
              </button>
              <button
                type="button"
                className={`trade-toggle-btn sell ${
                  tradeType === "sell" ? "active" : ""
                }`}
                onClick={() => setTradeType("sell")}
              >
                팔래요
              </button>
            </div>

            <form className="exchange-form" onSubmit={handleExchange}>
              <div className="form-field">
                <label className="form-field-label">
                  {tradeType === "buy" ? "매수 금액" : "매도 금액"}
                </label>
                <div className="form-input-wrapper">
                  <input
                    type="number"
                    className="exchange-input"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step={selectedCurrency === "JPY" ? "1" : "0.01"}
                  />
                  <span className="form-input-suffix">
                    {tradeType === "buy"
                      ? `${selectedCurrency === "USD" ? "달러" : "엔"} 사기`
                      : `${selectedCurrency === "USD" ? "달러" : "엔"} 팔기`}
                  </span>
                </div>
              </div>

              <div className="form-arrow">
                <div className="arrow-circle">▼</div>
              </div>

              <div className="form-field">
                <label className="form-field-label">
                  {tradeType === "buy" ? "필요 원화" : "받을 원화"}
                </label>
                <div className="form-input-wrapper result">
                  {quoteLoading ? (
                    <div className="loading-spinner small" />
                  ) : (
                    <span className="form-result">
                      {quote ? formatNumber(quote.krwAmount, 0) : "0"}
                      <span className="form-result-suffix">
                        {tradeType === "buy"
                          ? " 원 필요해요"
                          : " 원 받을 수 있어요"}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="form-bottom">
                <div className="applied-rate">
                  <span className="applied-rate-label">적용 환율</span>
                  <span className="applied-rate-value">
                    1 {selectedCurrency} ={" "}
                    {currentRate ? formatNumber(currentRate.rate, 2) : "-"} 원
                  </span>
                </div>

                <button
                  type="submit"
                  className="exchange-submit-btn"
                  disabled={orderMutation.isPending || !quote}
                >
                  {orderMutation.isPending ? "처리 중..." : "환전하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
