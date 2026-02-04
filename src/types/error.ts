export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "MISSING_PARAMETER"
  | "WALLET_INSUFFICIENT_BALANCE"
  | "INVALID_DEPOSIT_AMOUNT"
  | "INVALID_WITHDRAW_AMOUNT"
  | "CURRENCY_MISMATCH"
  | "INVALID_AMOUNT_SCALE"
  | "EXCHANGE_RATE_CURRENCY_MISMATCH"
  | "EXCHANGE_RATE_MISMATCH"
  | "UNSUPPORTED_FOREX_CONVERSION_CURRENCY"
  | "INVALID_EXCHANGE_RATE_CURRENCY"
  | "UNSUPPORTED_CURRENCY_FOR_KRW_CONVERSION";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  data: Record<string, string> | null;
}

export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "잘못된 요청입니다.",
  NOT_FOUND: "요청한 URL을 찾을 수 없어요.",
  UNAUTHORIZED: "로그인이 필요한 서비스입니다.",
  VALIDATION_ERROR: "요청 데이터가 이상해요.",
  MISSING_PARAMETER: "필수 요청 파라미터가 누락되었어요.",
  WALLET_INSUFFICIENT_BALANCE: "지갑의 잔액이 부족합니다.",
  INVALID_DEPOSIT_AMOUNT: "입금 금액이 유효하지 않습니다.",
  INVALID_WITHDRAW_AMOUNT: "출금 금액이 유효하지 않습니다.",
  CURRENCY_MISMATCH: "통화 타입이 일치하지 않습니다.",
  INVALID_AMOUNT_SCALE: "통화 정책에 맞지 않는 소수점 자릿수입니다.",
  EXCHANGE_RATE_CURRENCY_MISMATCH:
    "환율의 대상 통화와 변환하려는 금액의 통화가 일치하지 않습니다.",
  EXCHANGE_RATE_MISMATCH: "환율이 변경되었습니다. 다시 시도해주세요.",
  UNSUPPORTED_FOREX_CONVERSION_CURRENCY:
    "외화 간 직접 변환은 지원하지 않습니다.",
  INVALID_EXCHANGE_RATE_CURRENCY: "환율 정보의 통화는 KRW가 될 수 없습니다.",
  UNSUPPORTED_CURRENCY_FOR_KRW_CONVERSION:
    "원화(KRW) 변환은 KRW 통화만 지원합니다.",
};

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
