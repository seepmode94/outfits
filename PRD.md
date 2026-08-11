# PRD — Outfits

> **Documento de Produto** · Fonte única de verdade
> Última atualização: 2026-06-30 · Estado: visão fechada, pré-arquitetura

---

## 1. Resumo (em uma frase)

Uma **web app mobile-first** que ajuda jovens a vestirem-se bem todos os dias com a roupa que **já têm** — e, com o tempo, a evoluírem o armário para o estilo que **querem ter**. O cérebro é uma IA de visão (Gemini) que olha para as peças e sugere combinações pensadas para a ocasião e o tempo.

---

## 2. Problema & público-alvo

- **Quem**: jovens que querem vestir-se melhor mas (a) perdem tempo/indecisão de manhã, e (b) não sabem como evoluir o armário para o estilo que admiram.
- **Dor diária**: "tenho roupa, mas não sei o que combinar hoje."
- **Dor de aspiração**: "vejo looks que adoro, mas não sei o que me falta comprar para lá chegar."
- **Hoje resolvem assim**: vão ao Pinterest buscar ideias soltas, sem ligação ao que realmente possuem.

---

## 3. Proposta de valor

1. **Veste-me hoje** — sugestão rápida e contextual a partir do armário real do utilizador.
2. **Chega ao look que queres** — a partir de um print de inspiração, a IA diz o que já tens e o que te falta comprar.
3. **A IA aprende contigo** — guarda os teus gostos e o teu feedback, e afina as sugestões ao longo do tempo.

**O que nos diferencia:** as sugestões partem sempre do **armário real** do utilizador (não de catálogos genéricos), e a ponte entre "o que tenho" e "o que quero ser" é explícita e acionável.

---

## 4. Modelo de negócio (freemium)

| Camada | O que inclui | Objetivo |
|---|---|---|
| **Grátis** | "Veste-me hoje", armário, feedback | Gancho de uso diário → cria hábito |
| **Pago (subscrição)** | Análise de inspiração + plano de compras, planeamento de viagem/semana | Monetiza a *transformação* de estilo |

> Insight estratégico: o **herói** (utilidade diária) traz e retém pessoas; a **transformação** (análise de inspiração) é o que justifica pagar. São complementares, não concorrentes.

---

## 5. Pilares do produto

1. **Utilidade diária primeiro** — o coração da app é "diz-me o que vestir hoje".
2. **Parte sempre do armário real** do utilizador.
3. **IA de visão como cérebro** — reconhece peças e raciocina sobre combinações.
4. **Aprende com o utilizador** — gostos + feedback alimentam cada sugestão.
5. **Design moderno com motion intencional** — ver secção 9.
6. **Mobile-first, sem instalar** — PWA acessível em iPhone, Android e PC.

---

## 6. Modo de operação (o fluxo central)

### Adicionar uma peça (uma foto = uma peça)
1. Utilizador tira foto in-app **ou escolhe da galeria**.
2. O browser reduz a foto e envia-a ao servidor, que a guarda como **Captura** — ainda não é uma peça.
3. Em paralelo, sobre a **Foto original**: **recorte de fundo no servidor** → PNG com fundo transparente; e **Gemini** propõe os atributos (categoria, cor, padrão, formalidade, estação, material provável) mais a caixa de enquadramento da peça.
4. Utilizador **confirma/corrige** os atributos.
5. Só então a **Captura** se torna **peça**: guardam-se o Recorte, a Foto original e os atributos.

> Fluxo revisto a 2026-08-11. O passo 2 era "recorte no próprio dispositivo *(privado, grátis, on-device)*" — ver [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md) e ADR-0002.

### Sugerir um outfit ("Veste-me hoje")
1. Utilizador escolhe a **ocasião** (e opcionalmente onde vai).
2. App obtém a **meteorologia** do distrito do utilizador.
3. **Gemini** escolhe uma combinação a partir das peças guardadas, considerando ocasião + tempo + estação + gostos/feedback do utilizador.
4. App **monta o "quadro" do outfit** sobrepondo os recortes das peças.
5. Mostra a sugestão **+ explicação do porquê**.
6. Utilizador dá **feedback** (gostei / não gostei) → alimenta sugestões futuras.

---

## 7. Funcionalidades — v1 (MVP)

> Objetivo do v1: **lançar e validar o hábito diário**.

- [ ] **Contas & autenticação** (email + Google).
- [ ] **Perfil** (género, estilo preferido, tamanhos opcionais, distrito).
- [ ] **Armário**: adicionar peça (foto → recorte → reconhecimento Gemini → confirmação), listar, editar, remover.
- [ ] **"Veste-me hoje"**: seleção de ocasião + meteorologia → 1 outfit montado + explicação.
- [ ] **Feedback** (gostei / não gostei) guardado e usado nas sugestões.
- [ ] **PWA** instalável, responsiva, mobile-first.

---

## 8. Funcionalidades — v2 (futuro · monetização)

- [ ] **Análise de inspiração**: print de look → "tens X, falta-te Y" + plano de compras.
- [ ] **Planeamento** de viagem / semana (vários outfits de uma vez).
- [ ] **Subscrição** (paywall sobre as features de transformação).
- [ ] **Peças em falta** — visão geral de lacunas no armário.
- [ ] *(candidato)* deteção de múltiplas peças numa só foto / outfit completo.

---

## 9. Pilar de design & motion

**Direção**: moderno, limpo, premium. **Motion intencional** que dá vida — nunca enfeite que atrapalha. Fluido a **60fps** em mobile.

**Momentos de motion assinatura:**
- 🎬 **Montagem do outfit** — as peças recortadas voam/encaixam no quadro uma a uma (o momento "wow").
- 📸 **Recorte ao vivo** — a foto "descola" do fundo e revela a peça limpa.
- 👍👎 **Feedback por gesto** — arrastar a sugestão para o lado (estilo Tinder).
- 🔍 **Transições partilhadas** — tocar numa peça expande-a suavemente para o detalhe.
- ✨ **Estados de espera com classe** — shimmer elegante enquanto a IA pensa, nunca um spinner cru.

---

## 10. Stack técnica

| Camada | Escolha |
|---|---|
| Framework | **Next.js** (App Router) |
| Hosting | **Vercel** |
| Base de dados | **Postgres** |
| Autenticação | Email + Google |
| UI / design system | **Tailwind + shadcn/ui** |
| Motion | **Motion (Framer Motion)** |
| IA / visão | **Gemini API** (já em uso pelo utilizador) |
| Recorte de imagem | **No servidor** — ver [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md); fornecedor por fechar |
| Meteorologia | API gratuita (ex: **Open-Meteo**, sem chave) |
| App | **PWA** (instalável, mobile-first) |

---

## 11. Arquitetura da IA

- **Isolada atrás de um serviço de sugestões** — toda a app fala com uma camada interna ("serviço de IA"), nunca com o Gemini diretamente. Permite trocar/misturar modelos no futuro mexendo num só sítio.
- **Saída estruturada (JSON)** — o Gemini devolve atributos de peças e sugestões em formato que a app consome diretamente, não texto solto.
- **Contexto da sugestão** inclui: peças disponíveis (atributos), ocasião, meteorologia, estação, perfil/estilo, histórico de feedback.

---

## 12. Modelo de dados (alto nível — a detalhar na arquitetura)

- **User** — credenciais, perfil (género, estilo, tamanhos, distrito), preferências.
- **Garment (peça)** — imagem recortada, categoria, cor, padrão, formalidade, estação, material, dono.
- **Outfit (sugestão)** — conjunto de peças, ocasião, contexto (tempo/estação), explicação, data.
- **Feedback** — utilizador, outfit/peça, gostei/não gostei, timestamp.
- *(v2)* **Inspiration** — imagem de inspiração, peças que faltam, plano de compras.

---

## 13. Decisões assumidas

- **Login**: email + Google (sem password, mais simples em mobile).
- **Perfil**: género + estilo preferido + tamanhos (opcional) + distrito (para meteorologia).
- **Meteorologia**: Open-Meteo (gratuita, sem chave).
- **Ocasiões**: lista pré-definida (escritório, casual, evento, desporto, encontro…) + texto livre.
- ~~**Recorte**: on-device (privado, grátis).~~ → **revertido a 2026-08-10: o recorte passou para o servidor.** Ver [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md).
- **Foto**: uma foto = uma peça (v1).

---

## 14. Fora de âmbito (não-objetivos do v1)

- Sem dependência do Pinterest ou scraping de imagens de terceiros (legal + sustentável).
- Sem deteção de múltiplas peças numa foto.
- Sem rede social / partilha entre utilizadores.
- Sem integrações de e-commerce / compra direta (o plano de compras do v2 é informativo).
- Sem modelo de ML treinado de raiz — o "aprender" é via gostos + feedback no contexto da IA.

---

## 15. Riscos & considerações

- **Qualidade do recorte** — peças com fundos complexos podem recortar mal; precisamos de fallback/manual.
- **Qualidade do reconhecimento** — daí o passo de confirmação humana ser obrigatório no v1.
- **Custo da API Gemini** — monitorizar uso; estruturar prompts eficientes.
- **Privacidade** — fotos de roupa e dados pessoais; recorte on-device ajuda, mas precisamos de política clara.
- **Performance do motion em mobile** — animações têm de degradar com elegância em aparelhos fracos.

---

## 16. Métricas de sucesso (a refinar)

- **Hábito**: utilizadores que usam "Veste-me hoje" ≥ 3×/semana.
- **Ativação**: % de utilizadores que adicionam ≥ 5 peças na primeira sessão.
- **Qualidade**: rácio gostei/não gostei nas sugestões.
- **Conversão (v2)**: % de utilizadores grátis → pagos.

---

## 17. Próximos passos

1. **Arquitetura** — estrutura do projeto, modelo de dados detalhado, mapa de ecrãs.
2. **Design** — wireframes mobile-first dos ecrãs do v1 + linguagem de motion.
3. **Setup** — scaffold Next.js + Tailwind + shadcn/ui + Postgres + auth no Vercel.
4. **Construir o v1** — feature a feature, começando pelo armário e "Veste-me hoje".
