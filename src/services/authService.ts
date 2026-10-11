import { Config } from "@/constant/config";

export interface AuthUser {
  token: string;
  refresh_token?: string;
  session?: string;
  employee?: any;
}

/** Ambil data auth (token, session, employee) dari localStorage. */
export const getAuthData = (): AuthUser | null => {
  const raw = localStorage.getItem(Config.TokenName);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    console.warn("Data auth tidak valid, membersihkan sesi.");
    clearAuthData();
    return null;
  }
};

export const saveAuthData = (data: AuthUser) => {
  localStorage.setItem(Config.TokenName, JSON.stringify(data));
  if (data?.session) {
    localStorage.setItem(Config.SessionName, data.session);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(Config.TokenName);
  localStorage.removeItem(Config.SessionName);
};

/** Daftar tag user (uppercase) dari data login. */
export const getUserTags = (): string[] => {
  const auth = getAuthData();
  return String(auth?.employee?.tags ?? "")
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
};

/** Cek apakah user memiliki tag tertentu (tidak case-sensitive). */
export const hasTag = (name: string): boolean =>
  getUserTags().includes(name.trim().toUpperCase());

/** Login ke backend SiJEMPOL dan simpan hasilnya. */
export const login = async (
  username: string,
  password: string,
): Promise<AuthUser> => {
  const res = await fetch(`${Config.UrlBackend}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appid: Config.AppId,
      username,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error("Username atau password salah");
  }

  const data = await res.json();
  const auth: AuthUser = {
    token: data.token,
    refresh_token: data.refresh_token,
    session: data.session,
    employee: data.employee,
  };
  saveAuthData(auth);
  return auth;
};

export const logout = () => {
  clearAuthData();
  window.$message?.info("Anda berhasil logout.");
  window.location.href = import.meta.env.BASE_URL;
};
