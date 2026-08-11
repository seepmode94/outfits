# Modelos

## `u2netp.onnx`

Modelo de segmentação de objeto saliente usado para fazer o **Recorte** das Peças
no servidor (ver [ADR-0001](../docs/adr/0001-recorte-de-fundo-no-servidor.md)).

- **Arquitetura**: U²-Net "portable" (`u2netp`) — a variante pequena do U-2-Net
- **Origem**: <https://github.com/xuebinqin/U-2-Net>
- **Licença**: **Apache-2.0** — uso comercial permitido, sem restrição sobre os
  pesos treinados. Esta licença é a razão de ser desta escolha: o
  `@imgly/background-removal` que aqui estava antes é **AGPL-3.0**, incompatível
  com a camada paga do `PRD.md`.
- **Ficheiro ONNX**: descarregado das releases do
  [rembg](https://github.com/danielgatis/rembg) (pacote MIT), que redistribui os
  pesos convertidos para ONNX
- **Tamanho**: 4,5 MB (o `u2net` completo são 176 MB)

### Porque o pequeno

Medido a 2026-08-11 numa fotografia real de uma peça (873×763):

| | |
|---|---|
| Carregar a sessão | 65 ms |
| Inferência em CPU | 165 ms |
| Total por foto | ~256 ms |

Numa Vercel Function paga-se tempo de CPU ativo, por isso um modelo que resolve
em 165 ms em CPU é a diferença entre grátis e não grátis. Se a qualidade em
fotografias difíceis não chegar, o `u2net` completo é uma troca direta — mesma
arquitetura, mesma licença, mesmo pré-processamento — ao custo de mais CPU.

### Citação

> Qin, X., Zhang, Z., Huang, C., Dehghan, M., Zaiane, O. and Jagersand, M.
> "U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection."
> Pattern Recognition 106 (2020): 107404.
