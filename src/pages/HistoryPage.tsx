import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/History.scss";

const ITEMS_PER_LOAD = 20;

const HistoryPage = () => {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data: allOrders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await getOrders();
      return response.data;
    },
  });

  const displayedOrders = useMemo(() => {
    return allOrders.slice(0, displayCount);
  }, [allOrders, displayCount]);

  const hasMore = displayCount < allOrders.length;

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setDisplayCount((prev) =>
      Math.min(prev + ITEMS_PER_LOAD, allOrders.length)
    );
  }, [hasMore, allOrders.length]);

  useEffect(() => {
    if (isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMore]);

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat("ko-KR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="section-header">
            <h1 className="section-title">환전 내역</h1>
            <p className="section-subtitle">환전 내역을 확인하실 수 있어요.</p>
          </div>
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-container">
          <div className="section-header">
            <h1 className="section-title">환전 내역</h1>
            <p className="section-subtitle">환전 내역을 확인하실 수 있어요.</p>
          </div>
          <div className="history-error">{getErrorMessage(error)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="section-header">
          <h1 className="section-title">환전 내역</h1>
          <p className="section-subtitle">환전 내역을 확인하실 수 있어요.</p>
        </div>

        {allOrders.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">📋</div>
            <p className="history-empty-text">환전 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr className="history-table-header-empty"></tr>
                <tr>
                  <th>거래 ID</th>
                  <th>거래 일시</th>
                  <th>매수 금액</th>
                  <th>체결 환율</th>
                  <th>매도 금액</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{formatDate(order.orderedAt)}</td>
                    <td>
                      {formatNumber(
                        order.fromAmount,
                        order.fromCurrency === "KRW" ? 0 : 2
                      )}
                    </td>
                    <td>{formatNumber(order.appliedRate, 2)}</td>
                    <td>
                      {formatNumber(
                        order.toAmount,
                        order.toCurrency === "KRW" ? 0 : 2
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div ref={loadMoreRef} className="load-more-trigger">
              {hasMore && (
                <div className="loading-more">
                  <div className="loading-spinner-small" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
