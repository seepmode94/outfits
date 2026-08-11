---
status: aceite
data: 2026-08-11
supersedes: parcialmente o ADR-0001 (a escolha de "API gerida") e o ADR-0003
---

# 0004 — O Recorte é feito com u2netp auto-hospedado

O recorte passa a ser feito por **`u2netp` (U²-Net portable, Apache-2.0, 4,5 MB)**
via `onnxruntime-node` dentro da própria aplicação, em `lib/images/cutout.ts`,
exposto pelo Route Handler `/api/cutout`. **Zero custo por foto.**

## Porque isto inverte o ADR-0001

O [ADR-0001](./0001-recorte-de-fundo-no-servidor.md) rejeitou esta opção assim:

> **Modelo permissivo (BiRefNet, MIT) numa Vercel Function** — rejeitada: a ~2000
> fotos por dólar numa API gerida, auto-hospedar nunca paga o tempo de engenharia.

O raciocínio estava certo para a premissa que tinha: *se* se paga por foto, uma
API gerida a $0,0005 é mais barata que tempo de engenharia. A premissa mudou —
passou a exigir-se **custo zero por foto** — e com ela a conclusão. O tempo de
engenharia acabou por ser de uma tarde.

## O que ficou medido, e não assumido

Numa fotografia real de uma peça (873×763, calções azul-marinho):

| | |
|---|---|
| Carregar a sessão (arranque a frio) | 65–95 ms |
| Inferência em CPU | 165 ms |
| Total por foto | ~256 ms |
| Bordo com gradiente | 2,59% dos píxeis |

O Recorte saiu correcto, incluindo o vão entre as pernas dos calções — o fundo
interior, que é o caso onde estes modelos costumam falhar.

**Ressalva:** era uma fotografia de produto sobre fundo claro, o caso fácil. Um
telemóvel num quarto desarrumado é mais duro e ainda não foi testado. Se a
qualidade não chegar, o `u2net` completo (176 MB, mesma licença, mesmo
pré-processamento) é uma troca de uma linha, ao custo de mais CPU.

## Consequências

- **O ADR-0003 fica quase sem razão de ser.** O teto vitalício do Armário na
  camada grátis existia para limitar custo por foto, e esse custo passou a ser
  zero. O que sobra é tempo de CPU na Vercel, que é uma ordem de grandeza mais
  barato. O limite de ritmo mantém-se contra abuso; o teto vitalício deve ser
  reavaliado à luz disto — era a decisão que contrariava a estratégia do
  `PRD.md:34`, e talvez já não seja preciso contrariá-la.
- **O bundle da função cresce ~38 MB.** O `onnxruntime-node` traz 500 MB, dos
  quais 240 são o provider CUDA. O `next.config.ts` exclui o CUDA, o TensorRT,
  o win32 e o darwin do tracing; o que resta é o `libonnxruntime.so` de 37 MB.
- **Risco que só um deploy resolve:** o carregamento do módulo nativo foi
  verificado em Linux local, não no sandbox das Vercel Functions. Se falhar, a
  falha fica contida no `/api/cutout`.
- Saem do projeto o `@imgly/background-removal` (AGPL) e o peer
  `onnxruntime-web` — o problema de licença do ADR-0001 desaparece por completo,
  já que o Apache-2.0 do U-2-Net permite uso comercial sem condições de rede.
- O modelo é **vendorizado no repo** (`models/u2netp.onnx`) em vez de
  descarregado em runtime: sem dependência de terceiros no caminho crítico. A
  atribuição exigida pelo Apache-2.0 está em `models/README.md`.
- A Vercel não vê o ficheiro por tracing automático (é lido do disco), daí o
  `outputFileTracingIncludes`.
