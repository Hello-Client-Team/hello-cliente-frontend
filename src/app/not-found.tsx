import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container narrow py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="page-title">Esta página não foi encontrada.</h1>
      <p className="text-muted my-6">
        Volte à vitrine para encontrar um sistema para seu negócio.
      </p>
      <Link className="button button-primary" href="/">
        Explorar sistemas
      </Link>
    </div>
  );
}
