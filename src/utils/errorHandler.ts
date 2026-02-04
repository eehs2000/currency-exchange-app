import {
  isApiError,
  ERROR_MESSAGES,
  type ApiError,
  type ApiErrorCode,
} from "../types/error";

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "VALIDATION_ERROR" && error.data) {
      const validationMessages = Object.values(error.data);
      if (validationMessages.length > 0) {
        return validationMessages.join(", ");
      }
    }

    return (
      error.message ||
      ERROR_MESSAGES[error.code] ||
      "알 수 없는 오류가 발생했습니다."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "서버와 통신 중 오류가 발생했습니다.";
}

export function getErrorCode(error: unknown): ApiErrorCode | null {
  if (isApiError(error)) {
    return error.code;
  }
  return null;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isApiError(error) && error.code === "UNAUTHORIZED";
}

export function isInsufficientBalanceError(error: unknown): boolean {
  return isApiError(error) && error.code === "WALLET_INSUFFICIENT_BALANCE";
}

export function isExchangeRateMismatchError(error: unknown): boolean {
  return isApiError(error) && error.code === "EXCHANGE_RATE_MISMATCH";
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.code === "VALIDATION_ERROR";
}

export function handleApiError(
  error: unknown,
  options?: {
    onUnauthorized?: () => void;
    onError?: (message: string, code: ApiErrorCode | null) => void;
  }
): string {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  if (isUnauthorizedError(error) && options?.onUnauthorized) {
    options.onUnauthorized();
  }

  if (options?.onError) {
    options.onError(message, code);
  }

  return message;
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  return {
    code: "BAD_REQUEST",
    message: getErrorMessage(error),
    data: null,
  };
}
