"use client";

import { BarChart3, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as styles from "./bottom-nav.css";

const navItems = [
  { href: "/", label: "캘린더", icon: CalendarDays },
  { href: "/statistics", label: "통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="주요 메뉴">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`${styles.navLink} ${pathname === href ? styles.activeNavLink : ""}`}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon size={21} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
