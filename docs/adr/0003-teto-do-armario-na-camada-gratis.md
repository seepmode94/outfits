---
status: aceite
data: 2026-08-11
---

# 0003 — Teto do Armário na camada grátis

O recorte pago ([ADR-0001](./0001-recorte-de-fundo-no-servidor.md)) põe um custo variável por Peça dentro da camada **grátis**, porque é lá que o `PRD.md:31` coloca o Armário. Decidimos defender isso com **dois mecanismos distintos**: um **limite de ritmo** de Capturas por hora, contra abuso automatizado; e um **teto vitalício do número de Peças** na camada grátis, contra custo. O valor de trabalho é 60 Peças, ainda por validar contra tamanhos reais de armário.

## Porquê dois mecanismos e não um

O [ADR-0001](./0001-recorte-de-fundo-no-servidor.md) escreveu "exige teto de Peças/dia por utilizador". **Está errado, e esta ADR corrige-o**: um teto por dia limita o *ritmo*, não o *custo* — 20 Peças por dia para sempre é despesa ilimitada. Para limitar custo, o teto tem de ser sobre o total acumulado. São dois problemas com duas defesas, e nenhuma das duas substitui a outra.

## A inversão que isto corrige

| Camada (`PRD.md:31-32`) | O que inclui | Custo marginal real |
|---|---|---|
| **Grátis** | "Veste-me hoje", Armário, feedback | **alto** — um recorte pago por Peça |
| **Paga** | análise de inspiração, plano de compras, planeamento de viagem | quase nulo — só texto |

A camada grátis carrega a operação caríssima e a paga carrega as baratas. Um teto no Armário move o recurso caro para trás da subscrição, que é onde a economia o quer.

## O que isto custa, e é deliberado

O `PRD.md:34` diz que a camada grátis é o *"gancho de uso diário → cria hábito"*. Um muro no número de Peças aparece exactamente durante a construção do Armário — ou seja, **no momento do gancho**. Estamos a proteger o custo à custa da estratégia escrita no PRD, com os olhos abertos. Se o fornecedor de recorte acabar por ser barato, este teto deve ser reavaliado: a decisão faz sentido a $0,039 por Peça e é quase desnecessária a $0,00051.

## Consequências

- O teto e a escolha de fornecedor são **economicamente a mesma decisão**. Custo por Peça verificado a 2026-08-11: Gemini image generation $0,039 · Deep Infra `Bria/remove_background` $0,018 · Replicate `851-labs/background-remover` $0,00051. Com 1000 utilizadores grátis e 30 Peças cada, isso é $1170, $54 ou $15.
- O `PRD.md` precisa de uma linha nova na tabela de camadas a dizer o teto — hoje promete "Armário" sem qualificação.
- Um utilizador que chegue ao teto tem de conseguir **apagar Peças** para adicionar outras, ou o teto lê-se como avaria. Não há hoje fluxo de apagar Peça.
