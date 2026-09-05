import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { logoutAction } from "@/app/admins/actions";

const NAV_LINKS = [
  { href: "/admins", label: "Administrators" },
  { href: "/partners", label: "Partners" },
];

export function AppHeader({ active }: { active: "admins" | "partners" }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-center gap-8">
        <Logo className="h-6" />
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === `/${active}`;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
