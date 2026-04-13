import { PlaidError } from "plaid";

export type PlaidErrorCategory =
  | "ITEM_ERROR"
  | "INSTITUTION_ERROR"
  | "RATE_LIMIT"
  | "API_ERROR"
  | "INVALID_REQUEST"
  | "UNKNOWN";

export interface CategorizedPlaidError {
  category: PlaidErrorCategory;
  code: string;
  message: string;
  requiresRelink: boolean;
  retryable: boolean;
}

const RELINK_CODES = new Set([
  "ITEM_LOGIN_REQUIRED",
  "USER_PERMISSION_REVOKED",
  "ITEM_LOCKED",
  "ACCESS_NOT_GRANTED",
]);

export function categorizePlaidError(error: unknown): CategorizedPlaidError {
  const plaidError = (error as { response?: { data?: PlaidError } })?.response
    ?.data;

  if (!plaidError || !plaidError.error_code) {
    return {
      category: "UNKNOWN",
      code: "UNKNOWN",
      message: String(error),
      requiresRelink: false,
      retryable: false,
    };
  }

  const code = plaidError.error_code;
  const message = plaidError.error_message || code;

  switch (plaidError.error_type) {
    case "ITEM_ERROR":
      return {
        category: "ITEM_ERROR",
        code,
        message,
        requiresRelink: RELINK_CODES.has(code),
        retryable: false,
      };
    case "INSTITUTION_ERROR":
      return {
        category: "INSTITUTION_ERROR",
        code,
        message,
        requiresRelink: false,
        retryable: true,
      };
    case "RATE_LIMIT_EXCEEDED":
      return {
        category: "RATE_LIMIT",
        code,
        message,
        requiresRelink: false,
        retryable: true,
      };
    case "API_ERROR":
      return {
        category: "API_ERROR",
        code,
        message,
        requiresRelink: false,
        retryable: true,
      };
    case "INVALID_REQUEST":
      return {
        category: "INVALID_REQUEST",
        code,
        message,
        requiresRelink: false,
        retryable: false,
      };
    default:
      return {
        category: "UNKNOWN",
        code,
        message,
        requiresRelink: false,
        retryable: false,
      };
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const categorized = categorizePlaidError(error);
      if (!categorized.retryable || attempt === maxRetries) {
        throw error;
      }
      const jitter = Math.random() * 500;
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}
