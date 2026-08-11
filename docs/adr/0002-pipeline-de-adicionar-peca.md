---
status: aceite
data: 2026-08-11
---

# 0002 — O pipeline de adicionar peça

Mover o recorte para o servidor ([ADR-0001](./0001-recorte-de-fundo-no-servidor.md)) deixou toda a ordem do fluxo por desenhar. Decidimos: o browser reduz a **Foto original** (lado maior 2048px) e envia-a num `POST` para um **Route Handler**; o servidor guarda-a de imediato como **Captura**; dispara **em paralelo** o recorte e a análise Gemini, ambos sobre a Foto original; e só a confirmação humana dos **Atributos** transforma a Captura em **Peça**. Persistem-se as **duas** imagens — `garments.imageUrl` é o **Recorte**, `garments.originalImageUrl` (nullable) é a Foto original, que nunca é exibida ao utilizador.

## Porque a análise corre sobre a Foto original, e em paralelo

Medido a 2026-08-11, já com a chave Gemini instalada, sobre uma t-shirt sintética num fundo de madeira com a silhueta conhecida:

| | `gemini-3.6-flash` | `gemini-2.5-flash` |
|---|---|---|
| Latência | 3845 ms | 6372 ms |
| Instrução "responde em português" | cumprida | **ignorada** ("navy", "cotton") |
| `box_2d` devolvida | [293, 187, 820, 813] | [250, 250, 750, 750] |
| Verdade medida | [293, 187, 820, 812] | idem |
| Cor do fundo nas cores da peça | **nenhuma** | nenhuma |

Três conclusões. A **contaminação pelo fundo não se materializou**, que era o único argumento sério para analisar o Recorte em vez da Foto original — embora o teste seja de fundo plano, e um chão desarrumado seja mais duro. Analisar a Foto original permite que as duas chamadas **partam ao mesmo tempo**, porque precisam do mesmo input: a espera passa a ser `max(análise, recorte)` em vez da soma, e uma falha no recorte deixa de corromper também os Atributos. E o `gemini-3.6-flash` devolve de graça uma caixa de enquadramento quase exacta (erro de 1 em 1000), aproveitável para enquadrar o Recorte no ecrã.

Consequência directa: **`lib/ai/provider.ts` deve passar o default de `gemini-2.5-flash` para `gemini-3.6-flash`**, por medição e não por preferência.

## Porque um Route Handler e não uma server action

Os docs da versão instalada (Next 16.2.9, `serverActions.md:26`) fixam o corpo de uma server action em **1 MB** por omissão. Uma foto de telemóvel são 2–5 MB. O Route Handler não tem esse limite, aceita corpos grandes na Vercel, e — o que pesou mais neste projeto — **é testável com `curl`**, ao contrário de uma server action. A alternativa de enviar o cliente directamente para o Blob e passar só o URL ao fornecedor foi rejeitada: exigiria um URL publicamente buscável da fotografia do utilizador e uma ida-e-volta extra.

## Porque a Captura existe

`CONTEXT.md` fixa que o Recorte é condição para a Peça existir e que uma Peça sem confirmação humana não entra no Armário. Isso proíbe gravar primeiro e enriquecer depois: uma "Peça pendente" é, por definição, impossível. Mas se nada persistir antes da espera, uma falha de rede a meio do recorte obriga o utilizador a refotografar. A **Captura** resolve as duas coisas: a Foto original fica salva antes da espera, sem que exista Peça nenhuma.

## Consequências

- Uma **Captura abandonada deixa um blob órfão**. Exige limpeza periódica (`crons` no `vercel.ts`) — trabalho que não existiria se nada persistisse antes da confirmação.
- **Deixa de haver progresso para reportar.** `components/camera/garment-capture.tsx:124` mostra `● A analisar… {progress}%`, alimentado pelo callback da biblioteca on-device que o ADR-0001 eliminou. O shimmer mantém-se; a percentagem tem de dar lugar a texto por etapas.
- Guardar a Foto original **agrava a exposição de privacidade** já aberta pelo ADR-0001: as fotos não passam apenas pelo servidor, ficam lá. A política de privacidade tem de o dizer.
- `garments` precisa de duas colunas novas: `originalImageUrl` (nullable) e `isFavourite` (boolean, default false — ver **Favorito** no `CONTEXT.md`). O `feedback.garmentId` que já existe fica reservado para o seu propósito original: "esta peça não funcionou *neste* outfit". Estado e acontecimento não se misturam na mesma tabela.
- **O fornecedor do recorte continua em aberto** e é o único bloqueio do pipeline. Está escolhida a via de geração de imagem do Gemini, que exige faturação ativa na conta Gemini — os 7 modelos de imagem devolvem `free tier limit: 0`. Ver ADR-0003 para o que isso custa.
