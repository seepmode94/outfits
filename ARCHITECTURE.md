# Arquitetura — Outfits

> Acompanha o `PRD.md`. Foco no **v1 (MVP)**, com ganchos pensados para o v2.
> Última atualização: 2026-06-30 · Estado: proposta para validação

---

## 1. Visão técnica em uma frase

App **Next.js (App Router) + PWA**, com **Server Components** a fazer o trabalho de dados e ecrãs interativos (câmara, gestos, motion) como **Client Components**. A IA (Gemini) vive numa **camada isolada** no servidor, que devolve **JSON estruturado**. Imagens recortadas **no servidor** ([ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md)) e guardadas em Blob.

---

## 2. Stack detalhada & decisões

| Camada | Recomendação | Porquê | Decisão |
|---|---|---|---|
| Framework | Next.js (App Router) | Já definido | ✅ |
| Hosting | Vercel | Já definido | ✅ |
| UI | Tailwind + shadcn/ui | Base moderna e limpa | ✅ |
| Motion | Motion (Framer Motion) | Gestos + animações | ✅ |
| IA | Gemini via **Vercel AI SDK** (provider Google) | Output estruturado com Zod, e mantém a IA *trocável* | ✅ |
| Recorte | ~~`@imgly/background-removal` (browser)~~ → **no servidor**, via geração de imagem do Gemini | Ver [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md): ~95 MB no telemóvel + licença AGPL | ⛔ **bloqueado**: exige faturação Gemini (`free tier limit: 0`) |
| Meteorologia | Open-Meteo | Grátis, sem chave | ✅ |
| **Base de dados** | **Postgres (Neon, via Vercel)** | Serverless, integra com Vercel | ✅ |
| **ORM** | **Drizzle** | Leve, type-safe, migrations simples | ✅ |
| **Auth** | **Auth.js (NextAuth)** | Grátis, Google + email | ✅ |
| Armazenamento de imagens | **Vercel Blob** | Guarda os PNGs recortados | ✅ |

> Todas as decisões de stack estão fechadas. Pronto para scaffold.

---

## 3. Estrutura do projeto

```
outfits/
├── app/
│   ├── layout.tsx                  # root: providers, manifest PWA, fontes
│   ├── (auth)/
│   │   ├── sign-in/page.tsx        # Google / email
│   │   └── onboarding/page.tsx     # perfil inicial (género, estilo, distrito)
│   └── (app)/
│       ├── layout.tsx              # tab bar inferior + motion de transição
│       ├── page.tsx                # 🏠 "Veste-me hoje" (home/herói)
│       ├── wardrobe/
│       │   ├── page.tsx            # grelha do armário
│       │   ├── add/page.tsx        # fluxo adicionar peça
│       │   └── [id]/page.tsx       # detalhe da peça
│       ├── outfit/
│       │   └── [id]/page.tsx       # resultado do outfit (quadro animado)
│       └── profile/page.tsx        # perfil + definições
├── components/
│   ├── ui/                         # shadcn
│   ├── wardrobe/                   # cartão de peça, grelha, form de atributos
│   ├── outfit/                     # quadro de outfit, cartão de sugestão
│   ├── motion/                     # primitivas de animação reutilizáveis
│   └── camera/                     # captura + preview de recorte
├── lib/
│   ├── ai/                         # 🧠 CAMADA ISOLADA DA IA
│   │   ├── index.ts                # interface pública do serviço
│   │   ├── provider.ts             # config Gemini (trocável)
│   │   ├── analyze-garment.ts      # foto → atributos
│   │   ├── suggest-outfit.ts       # contexto → outfit
│   │   └── schemas.ts              # schemas Zod (output estruturado)
│   ├── db/
│   │   ├── schema.ts               # tabelas Drizzle
│   │   └── index.ts                # cliente
│   ├── weather/index.ts            # cliente Open-Meteo
│   ├── image/background-removal.ts # recorte on-device
│   └── auth/index.ts               # config Auth.js
├── public/
│   ├── manifest.json               # PWA
│   └── icons/                      # ícones da app
└── drizzle/                        # migrations
```

**Princípio-chave**: nenhum ecrã chama o Gemini diretamente. Tudo passa por `lib/ai/index.ts`. Trocar de modelo = mexer só em `provider.ts`.

---

## 4. Modelo de dados (v1)

### `users`
`id` · `email` · `name` · `image` · `created_at`
*(gerido em grande parte pelo Auth.js)*

### `profiles` (1:1 com user)
`user_id` · `gender` · `preferred_styles` (array) · `sizes` (jsonb, opcional) · `district` · `created_at` · `updated_at`

### `garments` (peça de roupa)
`id` · `user_id` · `image_url` (PNG recortado no Blob) · `category` (enum) · `subcategory` · `primary_color` · `colors` (array) · `pattern` · `formality` (enum) · `seasons` (array) · `material` · `notes` · `created_at` · `updated_at`

### `outfits` (sugestão gerada/guardada)
`id` · `user_id` · `occasion` · `context` (jsonb: tempo, estação, local) · `explanation` · `status` (suggested / saved / worn) · `created_at`

### `outfit_garments` (junção N:N)
`outfit_id` · `garment_id` · `role` (top / bottom / footwear / …)

### `feedback`
`id` · `user_id` · `outfit_id` (nullable) · `garment_id` (nullable) · `value` (like / dislike) · `created_at`

> **Hooks para v2**: tabelas `inspirations` e `shopping_plan` entram depois; o modelo atual não precisa de mudar para as acomodar.

### Taxonomia de categorias (enum proposto)
- **top**: t-shirt, camisa, camisola, hoodie, blusa
- **bottom**: jeans, calças, calções, saia
- **dress**: vestido, macacão
- **outerwear**: casaco, blazer, sobretudo
- **footwear**: ténis, botas, sapatos, sandálias
- **accessory**: mala, cinto, chapéu, lenço, joias, óculos

---

## 5. Mapa de ecrãs & navegação (v1)

**Navegação base**: tab bar inferior (mobile-native) com **3 separadores** + botão de adicionar em destaque.

```
┌─────────────────────────────────────┐
│  Auth → Onboarding (1ª vez)          │
└─────────────────────────────────────┘
                 │
   ┌─────────────┼──────────────┐
   ▼             ▼              ▼
🏠 Veste-me    👕 Armário     👤 Perfil
   hoje
```

**1. 🏠 Veste-me hoje (herói)**
- Escolhe **ocasião** → app mostra **tempo do distrito** → botão *Gerar outfit*.
- Se o armário estiver vazio → CTA para adicionar peças.

**2. Resultado do outfit** (`outfit/[id]`)
- 🎬 **Quadro animado**: peças encaixam uma a uma.
- **Explicação** do porquê.
- 👍👎 **Feedback por gesto** (arrastar).
- Ações: *Tentar outro* · *Guardar*.

**3. 👕 Armário** (`wardrobe`)
- Grelha de peças por categoria, com filtro.
- FAB **+** → fluxo de adicionar.
- Tocar numa peça → 🔍 transição partilhada para detalhe.

**4. Adicionar peça** (`wardrobe/add`)
- 📸 Captura/upload → **recorte ao vivo** (a peça descola do fundo) → form de **atributos** pré-preenchidos pelo Gemini para confirmar/corrigir → guardar.

**5. Detalhe da peça** (`wardrobe/[id]`)
- Imagem recortada + atributos · editar/remover.

**6. 👤 Perfil** (`profile`)
- Editar perfil (género, estilo, distrito) · terminar sessão · *(v2: subscrição)*.

---

## 6. Camada de IA — interface

```ts
// lib/ai/index.ts — a única porta de entrada para a IA
analyzeGarment(image): Promise<GarmentAttributes>      // foto → atributos
suggestOutfit(input: SuggestionContext): Promise<OutfitSuggestion>
// v2: analyzeInspiration(image, wardrobe): Promise<ShoppingGaps>
```

- `SuggestionContext` = peças disponíveis + ocasião + meteorologia + estação + perfil/estilo + histórico de feedback.
- Output sempre validado por **schema Zod** → a app nunca lida com texto solto.

---

## 7. Fluxos de dados (resumo)

**Adicionar peça**: Câmara ou galeria (client) → browser reduz a **Foto original** → `POST` a um **Route Handler** → servidor guarda a **Captura** no Blob → **em paralelo**: recorte no servidor *(fornecedor por fechar)* e `analyzeGarment` sobre a Foto original → form de confirmação dos **Atributos** → só então grava em `garments` (Recorte + Foto original + Atributos). *(Desenhado a 2026-08-11 — [ADR-0002](./docs/adr/0002-pipeline-de-adicionar-peca.md); recorte no servidor por [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md).)*

**Gerar outfit**: ocasião (client) → busca peças + perfil + feedback + `weather` (server) → `suggestOutfit` → grava `outfit` + `outfit_garments` → renderiza quadro animado.

---

## 8. PWA & performance

- `manifest.json` + ícones + service worker → instalável, ecrã inteiro, splash.
- Imagens otimizadas (Next/Image). O recorte é feito no servidor por API gerida ([ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md)); a foto deve ser reduzida no cliente antes do upload para não castigar a rede móvel.
- Motion com `prefers-reduced-motion` e degradação elegante em aparelhos fracos.

---

## 9. Próximos passos

1. **Confirmar as 3 decisões** da secção 2 (ORM · Auth · Neon+Blob).
2. **Scaffold**: criar o projeto Next.js + Tailwind + shadcn/ui + Drizzle + Auth.js + PWA.
3. **Modelo de dados**: implementar o schema e migrations.
4. **Construir o v1** feature a feature: armário → adicionar peça → "Veste-me hoje".
