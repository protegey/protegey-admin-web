import Link from "next/link";
import { Handshake, ShieldCheck, Users } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { getSessionUser } from "@/lib/session";
import { getLang } from "@/lib/i18n/lang";
import { t } from "@/lib/i18n/strings";
import { RefreshButton } from "@/components/RefreshButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, lang] = await Promise.all([getSessionUser(), getLang()]);

  const navItems: NavItem[] = [
    {
      label: t(lang, "navPartners"),
      icon: <Handshake className="size-4" />,
      children: [
        { href: "/partners", label: t(lang, "navPartnersList") },
        { href: "/partners/pending-kyb", label: t(lang, "navPartnerVerification") },
      ],
    },
    {
      label: t(lang, "navSanctions"),
      icon: <ShieldCheck className="size-4" />,
      children: [{ href: "/sanctions", label: t(lang, "navSanctionsList") }],
    },
  ];

  return (
    <div className="flex h-svh bg-background">
      <Sidebar
        navItems={navItems}
        footer={
          <div className="flex flex-col gap-3">
            <p className="truncate px-1 text-xs text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LangToggle />
              <SignOutButton className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted" />
            </div>
          </div>
        }
      />
      <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex justify-end gap-2 border-b border-border px-8 py-3">
            <RefreshButton />
            <Link
            href="/admins"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Users className="size-4" />
            {t(lang, "navAdministrators")}
          </Link>
        </div>
        <div className="flex-1 px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
