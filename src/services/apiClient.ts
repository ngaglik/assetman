import { Config } from "@/constant/config";
import { getAuthData, saveAuthData, logout } from "./authService";

/**
 * Wrapper `fetch` yang otomatis menambahkan header auth dan
 * mencoba refresh token sekali saat menerima 401/403.
 */
export const apiFetch = async (
  url: string,
  options: any = {},
): Promise<Response> => {
  let auth = getAuthData();

  if (!options.headers) options.headers = {};
  if (auth?.token) options.headers["Authorization"] = `Bearer ${auth.token}`;
  if (auth?.session) options.headers["uSession"] = auth.session;
  if (Config.AppId) options.headers["AppId"] = Config.AppId;

  let response = await fetch(url, options);

  if ((response.status === 401 || response.status === 403) && auth?.token) {
    console.warn("Token kedaluwarsa, mencoba refresh...");
    const refreshed = await refreshToken();
    if (!refreshed) {
      logout();
      return response;
    }

    auth = getAuthData();
    options.headers["Authorization"] = `Bearer ${auth?.token ?? ""}`;
    if (auth?.session) options.headers["uSession"] = auth.session;

    response = await fetch(url, options);
  }

  return response;
};

export const refreshToken = async (): Promise<boolean> => {
  const auth = getAuthData();
  const rt = auth?.refresh_token;
  if (!rt) return false;

  try {
    const res = await fetch(`${Config.UrlBackend}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt, appId: Config.AppId }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    saveAuthData({
      token: data.token ?? data.accessToken,
      refresh_token: data.refresh_token ?? data.refreshToken,
      session: auth?.session,
      employee: auth?.employee,
    });

    console.log("Token berhasil diperbarui.");
    return true;
  } catch (error) {
    console.error("Refresh error:", error);
    return false;
  }
};
