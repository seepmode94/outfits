# Outfits

App que sugere o que vestir a partir da roupa que o utilizador já tem. Este ficheiro é o **glossário do domínio** — a linguagem que o código, os docs e as conversas devem usar. Não é especificação: o produto vive no `PRD.md`, a técnica no `ARCHITECTURE.md`, e as decisões em `docs/adr/`.

## Linguagem

**Peça**:
Um artigo de roupa que o utilizador possui. Uma fotografia = uma Peça.
_Evitar_: item, artigo, produto, garment

**Foto original**:
A fotografia que o utilizador tirou ou escolheu, reduzida apenas em dimensão para transporte. É o registo fiel da Peça: nunca é exibida ao utilizador, existe para se poder refazer o **Recorte**.
_Evitar_: upload, imagem de origem, raw

**Captura**:
Uma tentativa de adicionar uma Peça que já tem a **Foto original** guardada mas ainda não é uma **Peça**: falta-lhe o **Recorte**, a confirmação dos **Atributos**, ou ambos. Não pertence ao **Armário** e expira se não for confirmada.
_Evitar_: rascunho, pendente, peça temporária, upload

**Recorte**:
O PNG de uma Peça com fundo transparente. É o **resultado**, não o ato — "fazer o recorte" descreve o passo, "o Recorte" é o ficheiro.
_Evitar_: cutout, imagem processada, thumbnail

**Atributos**:
As características estruturadas de uma Peça — categoria, subcategoria, cor principal, cores, padrão, formalidade, estações, material — propostas pela IA e confirmadas pelo utilizador.
_Evitar_: metadados, tags, propriedades

**Favorito**:
Uma **Peça** que o utilizador marcou como preferida. É uma marca do utilizador sobre a Peça, não um **Atributo** — a IA não a propõe nem a confirma. Influencia as sugestões de **Outfit**.
_Evitar_: like, gosto, coração, feedback

**Armário**:
O conjunto das Peças de um utilizador.
_Evitar_: guarda-roupa, closet, coleção

**Outfit**:
Uma combinação de Peças sugerida para uma ocasião e um contexto (tempo, estação).
_Evitar_: look, conjunto, sugestão

## Relações

- Um **Utilizador** tem um **Armário**; um **Armário** tem muitas **Peças**
- Uma **Peça** nasce de uma **Foto original**, tem exatamente um **Recorte** e um conjunto de **Atributos**
- Um **Outfit** combina várias **Peças** e apresenta-se sobrepondo os seus **Recortes**

## Diálogo de exemplo

> **Dev:** Se o **Recorte** falhar, a **Peça** existe?
>
> **Domínio:** Não. O quadro do **Outfit** sobrepõe **Recortes** — uma **Foto original** com fundo estraga-o. Portanto o **Recorte** é condição para a **Peça** existir, não um extra.
>
> **Dev:** E os **Atributos**, também são condição?
>
> **Domínio:** Os **Atributos** a IA propõe, o utilizador confirma. Uma **Peça** sem confirmação humana não entra no **Armário**.

## Ambiguidades sinalizadas

- **"online"** foi usado com o sentido de "no servidor", não de "disponível". Resolvido: o recorte é feito no servidor — ver [ADR-0001](./docs/adr/0001-recorte-de-fundo-no-servidor.md).
- **"recorte"** era usado para o ato e para o resultado. Resolvido: **Recorte** é o ficheiro PNG; o ato diz-se "fazer o recorte".
- **"antes de qualquer processamento"** na definição de **Foto original** contradizia a redução de tamanho feita no browser antes do upload. Resolvido a 2026-08-11: a redução de dimensão para transporte não descaracteriza a Foto original; qualquer outro processamento sim.
- **"guarda-roupa" vs "armário"** — **Ratificado a 2026-08-11: Armário** em português (é o que o utilizador lê), `wardrobe` no código e nas rotas. A interface contradizia-se — `components/tab-bar.tsx:15` dizia "Armário" enquanto `app/(auth)/sign-in/page.tsx:77` e `app/(app)/gaps/page.tsx:17` diziam "guarda-roupa" ao mesmo utilizador. Decidiu-se por "Armário" porque cabe na tab bar de 4 itens, onde "Guarda-roupa" parte a linha. Falta alinhar: 2 strings visíveis, ~11 menções em `PRD.md`/`ARCHITECTURE.md`, e 3 em `lib/ai/` — uma das quais dentro de um prompt (`analyze-garment.ts:7`), que exige reteste.
