// Start the frontend first. All API/provider traffic is mocked; no real data or mail.
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const base = process.env.FRONTEND_TEST_URL || 'http://127.0.0.1:3100';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
const project = { id:'11111111-1111-4111-8111-111111111111', developerId:'dev', developer:{id:'dev',name:'Developer'}, title:'Sistema integrado', category:'Vendas', description:'Um sistema para testar a integração completa da plataforma.', productionUrl:'https://system.example.test', demoUrl:'https://demo.example.test', status:'APPROVED' };
const requests = [], errors = [];
async function scenario(role, loggedIn = true) {
  const context = await browser.newContext();
  let authenticated = loggedIn, adoptFailure = true, matches = [], revocations = role === 'DEVELOPER' ? [{id:'dev-rev',matchId:'old-match',requestedAt:'2026-09-11T12:00:00Z',deletionDeadlineAt:'2026-09-13T12:00:00Z',notificationAcceptedAt:'2026-09-11T12:00:15Z',status:'AWAITING_DELETION',match:{id:'old-match',merchant:{businessName:'Loja Solicitante'},project:{id:project.id,title:project.title}}}] : [];
  const me = { id:role === 'DEVELOPER' ? 'dev' : role.toLowerCase(), role, name:'Pessoa Teste', email:'test@example.test', merchant: role === 'MERCHANT' ? { businessName:'Loja Teste' } : null };
  const page = await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*', async route => {
    const req=route.request(), url=new URL(req.url());
    if(url.origin===new URL(base).origin) return route.continue();
    if(url.hostname.endsWith('example.test')) return route.fulfill({contentType:'text/html',body:'<h1>Destino externo de teste</h1>'});
    if(!url.pathname.startsWith('/api/v1/')) return route.abort();
    const p=url.pathname.slice(7), method=req.method();
    const headers={'access-control-allow-origin':new URL(base).origin,'access-control-allow-credentials':'true','access-control-allow-headers':'Content-Type, Authorization','access-control-allow-methods':'GET, POST, PATCH, PUT, OPTIONS'};
    const respond=(data,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(status>=400?{error:{code:'TEST_ERROR',message:data}}:{data})});
    if(method==='OPTIONS')return route.fulfill({status:204,headers});
    const body=req.postDataJSON(); requests.push({p,method,body,authorization:req.headers().authorization});
    if(p==='/auth/refresh')return respond(authenticated?{accessToken:'test-token'}:'Sessão ausente',authenticated?200:401);
    if(p==='/auth/login'||p==='/auth/admin/login'||p==='/auth/register'){
      if(body.password==='wrong')return respond('Credenciais inválidas.',401);
      authenticated=true;return respond({accessToken:'test-token',user:me},p==='/auth/register'?201:200);
    }
    if(p==='/auth/logout'){authenticated=false;return route.fulfill({status:204,headers});}
    if(p==='/users/me')return respond(me);
    if(p==='/projects')return respond({items:[project],total:1});
    if(p==='/projects/'+project.id)return respond(project);
    if(p==='/merchant/matches'&&method==='POST'){
      if(adoptFailure){adoptFailure=false;return respond('Aguarde a conclusão da exclusão anterior antes de readotar.',409);}
      matches=[{id:'match',projectId:project.id,merchantId:me.id,status:'ACTIVE',adoptedAt:new Date().toISOString(),termsVersion:'1.0',productionUrlSnapshot:project.productionUrl,project}];
      return respond({match:matches[0],redirectUrl:project.productionUrl,created:true},201);
    }
    if(p==='/merchant/matches')return respond({items:matches,total:matches.length});
    if(p==='/merchant/matches/match/revoke'){
      const revocation={id:'rev',matchId:'match',requestedAt:'2026-09-11T12:00:00Z',deletionDeadlineAt:'2026-09-13T12:00:00Z',status:'PENDING_NOTIFICATION'};
      matches[0]={...matches[0],status:'REVOKED',revocation}; return respond(revocation);
    }
    if(p==='/developer/projects'&&method==='POST')return respond({...project,...body,status:'PENDING'},201);
    if(p.startsWith('/developer/projects/')&&method==='PUT')return respond({...project,...body,status:'PENDING'});
    if(p==='/developer/projects'||p==='/admin/projects')return respond({items:[project],total:1});
    if(p==='/developer/revocations')return respond({items:revocations,total:revocations.length});
    if(p==='/developer/revocations/dev-rev/declare') { revocations[0]={...revocations[0],status:'DECLARED_DELETED',deletionDeclaredAt:new Date().toISOString()}; return respond(revocations[0]); }
    if(p.endsWith('/history'))return respond({checks:[],moderations:[]});
    if(p.endsWith('/moderation'))return respond({...project,status:body.decision});
    if(p.endsWith('/link'))return respond({authorizationUrl:'https://oauth.example.test/authorize'});
    throw new Error('Unhandled mock '+method+' '+p);
  });
  return {context,page};
}
try {
  const {context,page}=await scenario('MERCHANT',false);
  await page.goto(base+'/entrar/');
  await page.getByLabel('WhatsApp',{exact:true}).fill('(11) 99999-9999');
  await page.getByLabel('Senha',{exact:true}).fill('wrong');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page.getByRole('alert').filter({hasText:'Credenciais inválidas'})).toBeVisible();
  await page.getByLabel('Senha',{exact:true}).fill('test-password-123');
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(page).toHaveURL(/lojista\/sistemas/);
  await page.goto(base+'/sistemas/detalhes/?id='+project.id);
  await page.getByRole('button',{name:'Adotar sistema'}).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Confirmar adoção'}).click();
  await expect(page.getByText('Aguarde a conclusão da exclusão anterior antes de readotar.')).toBeVisible();
  await expect(page).toHaveURL(/sistemas\/detalhes/);
  await page.getByRole('button',{name:'Confirmar adoção'}).click();
  await expect(page).toHaveURL(/system.example.test/);
  await page.goto(base+'/lojista/sistemas/');
  await page.getByRole('button',{name:'Revogar acesso'}).click();
  await page.getByRole('button',{name:'Confirmar revogação'}).click();
  await page.getByRole('button',{name:/Revogações/}).click();
  await expect(page.getByText('Notificação aguardando envio')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Suas ferramentas, em um só lugar.'})).toBeVisible();
  await page.getByRole('button',{name:'Sair',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Entre para continuar'})).toBeVisible();
  assert.ok(requests.some(r=>r.p==='/auth/login'&&r.body.whatsapp==='+5511999999999'));
  await context.close();
  const registration=await scenario('MERCHANT',false);
  await registration.page.goto(base+'/cadastro/');
  await registration.page.getByLabel('Seu nome').fill('Lojista de Teste');
  await registration.page.getByLabel('Nome do negócio').fill('Loja Nova');
  await registration.page.getByLabel('Ramo de atuação').fill('Varejo');
  await registration.page.getByLabel('WhatsApp com DDD').fill('(11) 98888-7777');
  await registration.page.getByLabel('Senha (mínimo de 12 caracteres)').fill('test-password-123');
  await registration.page.getByRole('checkbox').check();
  await registration.page.getByRole('button',{name:'Criar conta'}).click();
  await expect(registration.page).toHaveURL(/lojista\/sistemas/);
  const registered=requests.find(r=>r.p==='/auth/register');
  assert.equal(registered.body.whatsapp,'+5511988887777');
  assert.equal(registered.body.businessSector,'Varejo');
  assert.equal(registered.body.termsVersion,'1.0');
  assert.equal('code' in registered.body,false); assert.equal('role' in registered.body,false);
  await registration.context.close();
  const dev=await scenario('DEVELOPER');
  await dev.page.goto(base+'/dev/projetos/novo/');
  await dev.page.getByLabel('Nome do projeto').fill('Novo projeto integrado');
  const focusRefresh=dev.page.waitForResponse(r=>r.url().includes('/developer/revocations'));
  await dev.page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await focusRefresh;
  await expect(dev.page.getByLabel('Nome do projeto')).toHaveValue('Novo projeto integrado');
  await dev.page.getByLabel('Descrição',{exact:true}).fill(project.description);
  await dev.page.getByLabel('URL de produção').fill(project.productionUrl);
  await dev.page.getByLabel('URL de demonstração').fill(project.demoUrl);
  await dev.page.getByRole('button',{name:'Enviar para análise'}).click();
  await expect(dev.page).toHaveURL(/dev\/projetos\/$/);
  const submitted=requests.find(r=>r.p==='/developer/projects'&&r.method==='POST');
  assert.deepEqual(Object.keys(submitted.body).sort(),['category','demoUrl','description','productionUrl','title']);
  await dev.page.goto(base+'/dev/projetos/novo/?id='+project.id);
  await expect(dev.page.getByLabel('Nome do projeto')).toHaveValue(project.title);
  await dev.page.getByLabel('Nome do projeto').fill('Projeto editado');
  await dev.page.getByRole('button',{name:'Enviar para análise'}).click();
  await expect(dev.page).toHaveURL(/dev\/projetos\/$/);
  assert.ok(requests.some(r=>r.method==='PUT'&&r.p==='/developer/projects/'+project.id));
  await dev.page.goto(base+'/dev/exclusoes/');
  await expect(dev.page.getByText('Loja Solicitante')).toBeVisible();
  await dev.page.getByRole('button',{name:'Declarar exclusão',exact:true}).click();
  await dev.page.getByRole('button',{name:'Confirmar declaração'}).click();
  await expect(dev.page.getByText(/Exclusão declarada em/)).toBeVisible();
  await dev.page.goto(base+'/dev/completar-cadastro/');
  await dev.page.getByRole('button',{name:'Conectar LinkedIn'}).click();
  await expect(dev.page).toHaveURL(/oauth.example.test/);
  await dev.context.close();
  const admin=await scenario('ADMIN',false);
  await admin.page.goto(base+'/entrar/?perfil=admin');
  await admin.page.getByLabel('E-mail',{exact:true}).fill('admin@example.test');
  await admin.page.getByLabel('Senha',{exact:true}).fill('test-password-123');
  await admin.page.getByRole('button',{name:'Entrar',exact:true}).click();
  await expect(admin.page).toHaveURL(/admin\/moderacao/);
  await admin.page.getByRole('combobox').selectOption('ALL');
  await admin.page.getByRole('button',{name:'Revisar projeto'}).click();
  await expect(admin.page.getByText('Nenhuma verificação registrada.')).toBeVisible();
  await admin.page.getByRole('button',{name:'Aprovar projeto'}).click();
  await expect(admin.page.getByText('Projeto aprovado e disponível na vitrine.')).toBeVisible();
  await admin.context.close();
  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: merchant registration/login, admin login, session restore/logout, adoption conflict and redirect, revocation, create/edit project, deletion declaration, OAuth linking and moderation. All API traffic mocked.');
} finally {await browser.close();}
