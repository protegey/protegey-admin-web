"use server";

import { redirect } from "next/navigation";
import { clearSessionCookies } from "./session";

export async function logoutAction() {
  await clearSessionCookies();
  redirect("/login");
}
