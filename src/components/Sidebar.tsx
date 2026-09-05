"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

export interface NavChild {
  href: string;
  label: string;
}

export interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  /** When set, this item is a group heading with always-visible sub-links instead of its own page. */
  children?: NavChild[];
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ navItems, footer }: { navItems: NavItem[]; footer: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-4 py-5">
        <Logo className="h-6" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-muted-foreground">
                  {item.icon}
                  {item.label}
                </div>
                <div className="flex flex-col gap-1 pl-6">
                  {item.children.map((child) => {
                    const isActive = isActivePath(pathname, child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          const isActive = item.href ? isActivePath(pathname, item.href) : false;
          return (
            <Link
              key={item.href}
              href={item.href ?? "#"}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">{footer}</div>
    </aside>
  );
}
