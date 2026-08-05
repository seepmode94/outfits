"use client";

// Fornecemos o nosso próprio global-error para contornar um bug do Turbopack
// (Next 16) ao resolver o global-error builtin no React Client Manifest.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          background: "#FFF4EC",
          color: "#17121F",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Algo correu mal 😕
        </h1>
        <p style={{ color: "#6b6b6b", margin: 0 }}>
          Ocorreu um erro inesperado. Tenta novamente.
        </p>
        <button
          onClick={() => reset()}
          style={{
            border: "none",
            borderRadius: "100px",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
            backgroundImage:
              "linear-gradient(160deg, #FF5638 0%, #7B2FF7 100%)",
          }}
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
