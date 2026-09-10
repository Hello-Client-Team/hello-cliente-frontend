export default function Loading() {
  return (
    <div className="container py-16" role="status">
      <div className="skeleton h-12 w-2/3 mb-8" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-80" />
        ))}
      </div>
      <span className="sr-only">Carregando sistemas</span>
    </div>
  );
}
