import Link from "next/link";
import { Handshake, Users } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { getSessionUser } from "@/lib/session";

const NAV_ITEMS: NavItem[] = [
  {
    label: "Partners",
    icon: <Handshake className="size-4" />,
    children: [
      { href: "/partners", label: "Partners" },
      { href: "/partners/pending-kyb", label: "Pending KYB" },
    ],
  },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        navItems={NAV_ITEMS}
        footer={
          <div className="flex flex-col gap-3">
            <p className="truncate px-1 text-xs text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SignOutButton className="flex-1 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted" />
            </div>
          </div>
        }
      />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex justify-end border-b border-border px-8 py-3">
          <Link
            href="/admins"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Users className="size-4" />
            Administrators
          </Link>
        </div>
        <div className="flex-1 px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
