import { ChevronRight, Palette, MapPin, Crown } from "lucide-react";

const ROWS = [
  { icon: Palette, label: "Estilo preferido", value: "Casual, streetwear" },
  { icon: MapPin, label: "Distrito", value: "—" },
  { icon: Crown, label: "Subscrição", value: "Grátis" },
];

export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6">
      <h1 className="font-heading text-3xl font-bold">Perfil</h1>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-2xl font-bold text-white">
          A
        </div>
        <div>
          <p className="text-lg font-semibold">A tua conta</p>
          <p className="text-sm text-muted-foreground">
            Inicia sessão para guardar tudo
          </p>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border">
        {ROWS.map((r, i) => {
          const Icon = r.icon;
          return (
            <button
              key={r.label}
              className={`flex items-center gap-3 p-4 text-left transition-colors hover:bg-secondary ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{r.label}</span>
              <span className="text-sm text-muted-foreground">{r.value}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </main>
  );
}
