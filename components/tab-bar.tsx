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
  { href: "/today", label: "Hoje", icon: Sparkles },
  { href: "/wardrobe", label: "Roupa", icon: Shirt },
];

const TABS_RIGHT: Tab[] = [{ href: "/profile", label: "Perfil", icon: User }];

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      className="relative flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium"
    >
      {active && (
        <motion.span
          layoutId="tab-active"
          className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-gradient"
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      )}
      <Icon
        className={`h-5 w-5 transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <span className={active ? "text-primary" : "text-muted-foreground"}>
        {tab.label}
      </span>
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-around border-t border-border bg-background/85 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      {TABS.map((t) => (
        <TabLink key={t.href} tab={t} active={isActive(t.href)} />
      ))}

      {/* Botão central de adicionar */}
      <Link
        href="/wardrobe/add"
        aria-label="Adicionar peça"
        className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-primary/30 transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </Link>

      {TABS_RIGHT.map((t) => (
        <TabLink key={t.href} tab={t} active={isActive(t.href)} />
      ))}
    </nav>
  );
}
