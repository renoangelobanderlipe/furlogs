import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && typeof window !== "undefined") {
      if (
        error.response?.status === 401 &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login?expired=1";
      }

      // Safety net: any 403 due to unverified email redirects to verify-email.
      // This should rarely fire now that /api/user no longer requires the
      // verified middleware, but protects against direct access to other routes.
      if (error.response?.status === 403) {
        const message = (
          error.response?.data as { message?: string } | undefined
        )?.message;
        if (
          message?.toLowerCase().includes("verified") &&
          window.location.pathname !== "/verify-email"
        ) {
          window.location.href = "/verify-email";
          return Promise.reject(error);
        }
      }

      if (error.response?.status === 423) {
        window.dispatchEvent(
          new CustomEvent("password-confirm-required", {
            detail: { config: error.config },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);
