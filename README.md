# Hello Cliente — frontend integrado

Next.js App Router, React e TypeScript. As telas usam a API Hello Cliente para
cadastros, sessões, catálogo e operações dos três perfis. O layout original foi
preservado; o acesso de demonstração não faz parte da aplicação em execução.

## Executar localmente

Crie `.env.local` com a URL pública da API, sem `/api/v1` no final:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3333
```

No PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev -- --port 3000
```

Abra http://localhost:3000. O backend precisa estar ativo e ter
`FRONTEND_URL=http://localhost:3000`, essa origem em `CORS_ORIGINS` e
`API_URL=http://localhost:3333`. Use `localhost` em ambos os endereços;
cookies não são compartilhados com `127.0.0.1`.

Somente a URL pública vai para o frontend. Credenciais de banco, SMTP, OAuth
e JWT ficam no backend. Alterações em `NEXT_PUBLIC_API_URL` exigem reiniciar o
servidor de desenvolvimento ou reconstruir a exportação estática.

## Fluxos

- Lojista: cadastro direto com WhatsApp/senha, login, adoção, revogação e acompanhamento.
- Desenvolvedor: login GitHub/LinkedIn, publicação e edição, declarações de exclusão,
  atualização de nome e vinculação de provedores em `/dev/completar-cadastro/`.
- Administrador: login por e-mail/senha em `/entrar/?perfil=admin`, moderação e histórico real.
- Vitrine: dados públicos da API; busca, categoria e ordenação sobre todas as páginas carregadas.
- Detalhes: `/sistemas/detalhes/?id=UUID` busca o projeto diretamente, inclusive após recarregar.

Os access tokens ficam apenas em memória. Cookies HttpOnly são enviados com
`credentials: include`; a aplicação restaura a sessão por refresh, serializa a rotação
e tenta renovar uma única vez ao receber 401 em uma rota protegida. Web Locks
coordenam refresh entre abas nos navegadores compatíveis. A API valida permissões
em todas as operações; o controle visual de perfil não substitui a autorização.

O callback OAuth volta para `/entrar/?oauth=success` ou `?oauth=linked`.
A sessão é restaurada e o usuário segue para seu painel. Vincular um provedor exige
login prévio como desenvolvedor; não há fusão automática de contas por e-mail.

Recuperação de senha está indisponível, conforme o backend. Não há formulário de
verificação WhatsApp. O e-mail confirmado pelo provedor é exibido como somente leitura.

Adoção redireciona apenas após a confirmação da API, usando `redirectUrl` retornado.
Sistemas já adotados usam a URL preservada no vínculo. Revogação e exclusão mostram
os prazos do servidor. Aceite SMTP é exibido separadamente da declaração de exclusão;
não significa entrega ou leitura. As ilustrações dos cartões são visuais de categoria,
não capturas de tela dos produtos.

## Organização

- `src/services/api.ts`: transporte, erros, paginação e renovação de sessão.
- `src/services/dto.ts`: adaptação dos contratos da API para as telas.
- `src/providers/api-provider.tsx`: usuário autenticado, dados e operações assíncronas.
- `src/features/`: telas de autenticação, catálogo, lojista, desenvolvedor e administrador.
- `src/services/demo`, `src/domain/operations.ts` e o provider antigo: código legado
  usado pelos testes originais; não importado pelas telas em execução.

## Verificar

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

O build continua gerando `out/` para hospedagem estática. Para os testes de navegador,
inicie o frontend em 3100, em outro terminal, e execute:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
# Em outro terminal:
npm.cmd run test:browser
```

Os testes usam Edge headless por padrão (`PLAYWRIGHT_CHANNEL`) e interceptam todas
as chamadas da API e provedores. `FRONTEND_TEST_URL` permite mudar o endereço do
frontend de teste. Não criam usuários no Supabase nem enviam e-mails.

Para validar integrações externas reais, use suas contas no fluxo de cadastro/login,
OAuth e nos painéis. Publicação, aprovação e revogação reais persistem dados; revogar
uma adoção pode enviar e-mail ao desenvolvedor. O roteiro completo permanece no
backend em `docs/TESTE-SWAGGER.md`.
