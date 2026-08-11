---
status: aceite
data: 2026-08-10
---

# 0001 — O recorte de fundo passa a ser feito no servidor

O `PRD.md:151` e o `ARCHITECTURE.md:23` fecharam o recorte como **on-device** com `@imgly/background-removal`, com os motivos declarados "privado, grátis". Na prática isso obriga cada telemóvel a descarregar **~95 MB** de um CDN terceiro antes de existir a primeira Peça — modelo `isnet_fp16` (84,1 MB, o default que `components/camera/garment-capture.tsx:30` usa por não passar config) mais `ort-wasm-simd-threaded.wasm` (11,3 MB) — o que contradiz o pilar "Mobile-first, sem instalar" (`PRD.md:51`) e é a causa provável da falha relatada em produção a 2026-08-10. **Decidimos mover o recorte para o servidor**: o cliente envia a Foto original, o servidor devolve o Recorte.

## Fator decisivo: a licença

`@imgly/background-removal` é **AGPL-3.0** (`LICENSE.md` do pacote). Correr esse modelo num servidor nosso aciona a cláusula de uso em rede (§13), que dá a quem usa o serviço direito ao código-fonte da aplicação — incompatível com a camada paga prevista em `PRD.md:38`. A ida para o servidor exclui portanto reutilizar o motor do img.ly e obriga a um fornecedor com licença comercial. *(Nota em aberto: mesmo no browser, distribuir um pacote AGPL dentro de um produto monetizado merece revisão.)*

## Opções consideradas

- **API gerida de matting** — escolhida. Fornecedor ainda por fechar entre Deep Infra `Bria/remove_background` (RMBG 2.0 · $0,018/foto · nativo do Marketplace da Vercel · licença comercial explícita) e Replicate `851-labs/background-remover` ($0,00051/foto · licença não declarada na página).
- **Modelo permissivo (BiRefNet, MIT) numa Vercel Function** — rejeitada: a ~2000 fotos por dólar numa API gerida, auto-hospedar nunca paga o tempo de engenharia.
- **Gemini 2.5 Flash Image** — rejeitada: não garante canal alpha, e o quadro de outfit (`PRD.md:102`) depende de fundo transparente.
- **Manter on-device com correções** (`model: "isnet_quint8"` a 42,3 MB, assets auto-hospedados, `preload()` antecipado, headers COOP/COEP) — rejeitada: continua a pôr dezenas de MB e a memória do Safari no caminho crítico, e não resolve o AGPL.

## Consequências

- Passa a haver **custo variável por foto na camada grátis** (`PRD.md:37`), onde o Armário vive. Exige teto de Peças/dia por utilizador desde o início.
- **As Fotos originais passam a sair do dispositivo** — o argumento "privado" de `PRD.md:151` deixa de valer e a política de privacidade (risco identificado em `PRD.md:171`) tem de o dizer.
- Ficam desatualizados: `PRD.md:151`, `ARCHITECTURE.md:23` e o fluxo em `ARCHITECTURE.md:172` ("recorte on-device → upload PNG para Blob").
- Saem do projeto `@imgly/background-removal` e a peer dependency `onnxruntime-web` (que o pnpm instalou automaticamente, sem estar no `package.json`).
- O Recorte deixa de poder ser mostrado "ao vivo" no dispositivo enquanto acontece; o momento de motion de `PRD.md:103` passa a ser desenhado em volta de uma chamada ao servidor.
