"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container py-20 text-center" role="alert">
      <h1 className="page-title">Não foi possível carregar esta página.</h1>
      <p className="text-muted my-5">Tente novamente em instantes.</p>
      <button className="button button-primary" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
