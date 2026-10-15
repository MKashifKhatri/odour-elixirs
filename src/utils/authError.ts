export const isAuthError = (error: unknown) => {
  if (typeof error === "string") {
    const normalized = error.toLowerCase();
    return normalized.includes("session expired") || normalized.includes("unauthorized");
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    response?: {
      status?: number;
      data?: {
        statusCode?: number;
        message?: string;
      };
    };
    statusCode?: number;
    message?: string;
  };

  const statusCode =
    maybeError.response?.status ??
    maybeError.response?.data?.statusCode ??
    maybeError.statusCode;

  const message =
    maybeError.response?.data?.message ??
    maybeError.message ??
    "";

  return statusCode === 401 || /session expired|unauthorized/i.test(message);
};
