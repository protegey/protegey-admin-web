import "server-only";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "protegey_access_token";
const REFRESH_TOKEN_COOKIE = "protegey_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export async function setSessionCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  const common = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
  };
  store.set(ACCESS_TOKEN_COOKIE, accessToken, { ...common, maxAge: 60 * 15 });
  store.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...common, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}
