import Link from "next/link";
export function TermsPage() {
  return (
    <article className="container legal-page">
      <p className="eyebrow">TRANSPARÊNCIA NA CONEXÃO</p>
      <h1 className="page-title">Termos e privacidade</h1>
      <p className="text-muted mt-3">
        Versão de demonstração 1.0 · Minuta de produto, sujeita à revisão
        jurídica antes do lançamento.
      </p>
      <div className="notice my-8">
        <p>
          Este ambiente usa projetos e perfis fictícios. Nenhum cadastro,
          pagamento ou notificação externa é processado.
        </p>
      </div>
      <section>
        <h2>1. O papel do Hello Cliente</h2>
        <p>
          A plataforma apresenta projetos e registra conexões entre lojistas e
          desenvolvedores. Não hospeda os sistemas adotados, não processa os
          pagamentos das lojas e não administra os bancos externos.
        </p>
      </section>
      <section>
        <h2>2. Adoção de um sistema</h2>
        <p>
          Ao confirmar a adoção, o lojista registra seu aceite à versão dos
          termos e cria uma conexão com o projeto. O uso acontece no endereço
          externo indicado pelo desenvolvedor. Condições de suporte,
          disponibilidade e uso devem ser consultadas antes da adoção.
        </p>
      </section>
      <section>
        <h2>3. Responsabilidades do desenvolvedor</h2>
        <p>
          O desenvolvedor mantém os endereços informados e responde pela
          operação do próprio sistema. Deve oferecer informações claras sobre
          suas funcionalidades, limitações e tratamento de dados.
        </p>
      </section>
      <section>
        <h2>4. Revogação e solicitação de exclusão</h2>
        <p>
          O lojista pode revogar uma adoção no painel. A política proposta prevê
          notificação ao desenvolvedor e prazo de 48 horas desde a solicitação
          para exclusão dos dados correspondentes no sistema externo. A
          declaração de conclusão não representa inspeção desse banco pela
          plataforma.
        </p>
      </section>
      <section>
        <h2>5. Dados da plataforma</h2>
        <p>
          A implementação integrada utilizará dados de conta, informações do
          negócio, projetos, adoções e registros operacionais. Antes do
          lançamento, a política final deverá identificar o responsável pelo
          tratamento, bases legais, destinatários, prazos de retenção e canal
          para exercício de direitos.
        </p>
      </section>
      <section>
        <h2>6. Disponibilidade e moderação</h2>
        <p>
          Projetos passam por avaliação antes de aparecer na vitrine. Falhas
          recorrentes de disponibilidade podem levar à suspensão. A aprovação
          não garante ausência de defeitos nem substitui a avaliação do lojista.
        </p>
      </section>
      <Link className="button button-primary mt-8" href="/">
        Voltar à vitrine
      </Link>
    </article>
  );
}
