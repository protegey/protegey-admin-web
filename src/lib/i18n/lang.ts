import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./strings";

// Shared cookie name with protegey-partner-web on purpose — see that app's lang.ts for why.
export const LANG_COOKIE = "protegey_lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "fr" ? "fr" : "en";
}
