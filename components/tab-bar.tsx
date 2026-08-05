"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Sparkles, Shirt, User, Plus, type LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { href: "/wardrobe", label: "Armário", icon: Shirt },
  { href: "/today", label: "Hoje", icon: Sparkles },
  { href: "/wardrobe/add", label: "Adicionar", icon: Plus },
  { href: "/profile", label: "Perfil", icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/wardrobe") {
      return pathname.startsWith("/wardrobe") && pathname !== "/wardrobe/add";
    }
    return pathname === href;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-white/92 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors ${
              active ? "text-coral" : "text-ink-soft/60"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-active"
                className="absolute -top-px h-0.5 w-8 rounded-full bg-coral"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
