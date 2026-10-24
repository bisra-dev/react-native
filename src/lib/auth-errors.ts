type ClerkErrorShape = {
  errors?: Array<{
    longMessage?: string | null;
    message?: string | null;
  }>;
  longMessage?: string | null;
  message?: string | null;
};

export function getAuthErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const clerkError = error as ClerkErrorShape;
    const firstApiError = clerkError.errors?.[0];
    const message =
      firstApiError?.longMessage ||
      firstApiError?.message ||
      clerkError.longMessage ||
      clerkError.message;

    if (message) return message;
  }

  if (error instanceof Error && error.message) return error.message;

  return "We couldn't complete that request. Please try again.";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}
