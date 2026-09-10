# Hello Cliente — frontend do MVP

Frontend em português, com Next.js App Router, TypeScript estrito e Tailwind CSS. As versões estáveis resolvidas pelo registro estão fixadas em package.json e package-lock.json. Este projeto usa Next.js real, com exportação estática para a prévia hospedada.

## Executar

```bash
npm ci
npm run dev
```

```bash
npm run typecheck
npm test
npm run build
```

O build gera `out/`. Não há segredos ou variáveis de ambiente obrigatórias para a demonstração. A identidade da prévia está em `.openai/hosting.json`; não a reutilize ao criar um projeto independente.

## Organização

- `src/app/`: rotas App Router, metadados e estados globais de erro/carregamento.
- `src/features/catalog/`: vitrine, cartões, prévias ilustrativas e adoção.
- `src/features/auth/`: entrada, cadastro, recuperação e conclusão de perfil.
- `src/features/merchant/`: sistemas adotados e revogações.
- `src/features/developer/`: projetos, submissão/edição e declarações de exclusão.
- `src/features/admin/`: moderação e consulta ilustrativa de indisponibilidade.
- `src/features/legal/`: minuta de termos e privacidade.
- `src/components/ui/`: componentes reutilizáveis de formulário, diálogo, estado vazio, botões e status.
- `src/components/layout/`: navegação compartilhada e controle visual por perfil.
- `src/domain/`: tipos e regras puras de adoção, revogação e moderação.
- `src/services/demo/`: dados fictícios isolados.
- `src/providers/`: estado e comandos da demonstração em memória.
- `src/lib/`: utilidades de estilo, datas e URLs externas.
- `tests/`: testes das regras de domínio mais importantes.

Páginas de rota permanecem pequenas. Componentes interativos possuem `use client` apenas onde necessário; apresentação e rotas sem interação permanecem compatíveis com Server Components. React Hook Form e Zod validam os formulários, Radix Dialog mantém foco e navegação por teclado em modais, e Sonner exibe feedback.

## Rotas

| Rota                            | Tela                                       |
| ------------------------------- | ------------------------------------------ |
| `/`                             | Vitrine com busca, categorias e ordenação  |
| `/sistemas/detalhes/?id=balcao` | Detalhes e adoção                          |
| `/entrar/`                      | Entrada por perfil                         |
| `/cadastro/`                    | Cadastro de lojista e etapa de verificação |
| `/recuperar-senha/`             | Recuperação e redefinição                  |
| `/termos/`                      | Minuta de termos e privacidade             |
| `/lojista/sistemas/`            | Adoções e revogações                       |
| `/dev/completar-cadastro/`      | Dados de contato do dev                    |
| `/dev/projetos/`                | Painel do desenvolvedor                    |
| `/dev/projetos/novo/`           | Enviar projeto                             |
| `/dev/projetos/novo/?id=balcao` | Editar projeto                             |
| `/dev/exclusoes/`               | Solicitações e declaração de exclusão      |
| `/admin/moderacao/`             | Aprovação, rejeição e revisão de suspensão |

Detalhes e edição recebem ID por query para que projetos criados durante a sessão funcionem na exportação estática sem precisar gerar páginas no servidor.

## O que é real e o que é demonstrativo

A navegação, os filtros, a validação, os diálogos e as regras de transição funcionam no navegador. As alterações duram até recarregar a página; não há armazenamento persistente. O acesso por perfil é uma simulação explícita, não um mecanismo de segurança.

OAuth GitHub/LinkedIn, WhatsApp, recuperação de senha, verificação de e-mail, JWT, envio de e-mails, cron de healthcheck e bancos de dados NÃO estão conectados. Os botões de login real informam essa limitação; botões específicos permitem explorar como cada perfil. Senhas digitadas não são persistidas, transmitidas ou logadas. Não coloque dados reais nesta demonstração.

Os projetos iniciais são fictícios, com prévias ilustrativas e sem URLs inventadas. Projetos submetidos pelo usuário podem conter URLs HTTP(S) reais, que são abertas apenas por ação explícita.

Os termos são uma minuta de produto; precisam de revisão jurídica antes de uso público.

## Roteiro funcional

1. Explore a vitrine e filtre por categoria.
2. Entre pelo acesso de demonstração de lojista e adote um projeto.
3. Revogue Balcão no painel. A solicitação aparece em Revogações com prazo de 48 horas.
4. Saia e entre como dev sem recarregar: a solicitação aparece em Solicitações de exclusão. Declare a conclusão.
5. Envie um projeto com URLs válidas. Ele aparece Em análise.
6. Saia, acesse Administração no rodapé e entre na demonstração de admin. Aprove o projeto.
7. Volte à vitrine: o projeto aprovado já está disponível.

## Integração com o backend definido

Mantenha o backend Node.js/TypeScript, PostgreSQL/Prisma, Zod e RabbitMQ ou BullMQ separado do frontend. Substitua a implementação do provider de demonstração por serviços HTTP tipados e, se necessário, um cache de consultas. Preserve os tipos de domínio e adapte DTOs do Prisma na fronteira da API, sem expor modelos ORM diretamente aos componentes.

Operações esperadas: listar/detalhar projetos, obter sessão, login/cadastro/recuperação, iniciar e concluir OAuth, listar/criar/revogar Matches, listar/enviar/editar projetos, moderar, listar revogações e declarar exclusão. Defina as rotas e os contratos OpenAPI antes de conectar: este frontend não presume que endpoints ainda não criados já existam.

O backend deve repetir TODAS as validações, verificar JWT e permissões, tratar cookies HttpOnly/Secure e CSRF quando aplicável, limitar requisições e garantir transações, unicidade e idempotência. `AccessGate` é conveniência visual e não proteção de dados. Nunca coloque segredos OAuth, credenciais de banco ou assinatura JWT em variáveis públicas do frontend.

O registro do Match, revogação e outbox precisa ser transacional. A confirmação do frontend deve ocorrer após sucesso da API. Trate 401, 403, 409, 422 e 5xx com feedback apropriado. O prazo do servidor é autoritativo. Bloqueie readopção enquanto a exclusão anterior estiver pendente. O backend deve correlacionar o lojista/Match aos dados externos antes do lançamento.

Healthcheck e notificações pertencem aos workers do backend. O frontend apenas consulta status e histórico. Declarar exclusão é uma afirmação do desenvolvedor, não comprovação por inspeção do banco externo.

## Evolução

Para SSR autenticado, remova `output: "export"` e hospede Next.js em ambiente compatível. Para manter frontend estático, use uma API externa com políticas de autenticação/CORS adequadas. A exportação estática não inclui endpoints secretos nem middleware de autorização.

O design usa tokens compartilhados em `globals.css`, componentes por responsabilidade e estilos responsivos. Testes de domínio e build foram executados; testes visuais e E2E com navegador não foram executados nesta entrega.
