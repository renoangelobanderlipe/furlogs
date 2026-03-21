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
