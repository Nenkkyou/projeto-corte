const dashboardData = {
  brand: { top: 'PROJETO', bottom: 'CORTE' },
  page: {
    title: 'Dashboard Operacional',
    subtitle: 'Visão consolidada da operação comercial e produtiva.',
    period: '01/05/2026 — 31/05/2026'
  },
  actions: [
    { label: '+ Novo Projeto', className: 'primary' },
    { label: '🏠 Ver Exemplo', className: 'secondary' }
  ],
  menuItems: ['Dashboard', 'Clientes', 'Projetos', 'Nova Proposta', 'Agenda', 'Home'],
  metrics: [
    { label: 'Total de Projetos', value: 128, trend: '+9% no mês' },
    { label: 'Em Orçamento', value: 21, trend: '+3 novas propostas' },
    { label: 'Em Produção', value: 42, trend: '4 entregas hoje' },
    { label: 'Entregues', value: 65, trend: '93% no prazo' }
  ],
  financeStats: [
    { label: 'Previsto', value: 'R$ 286.750,00' },
    { label: 'Confirmado', value: 'R$ 153.980,00' },
    { label: 'Ticket Médio', value: 'R$ 3.842,00' }
  ],
  deadlines: [
    ['Projeto Residencial Alpha', '15/05/2026'],
    ['Escritório Corporate', '22/05/2026'],
    ['Closet Master Suite', '29/05/2026']
  ],
  featured: {
    title: 'Projeto Premium Residencial Alpha',
    status: 'Em Produção',
    description: 'Cliente: Carlos Menezes • Ambiente: Cozinha • Status: Em Produção • Entrega: 15/05/2026.',
    actions: ['Baixar PDF', 'Gerar Orçamento', 'Enviar para Produção']
  }
};

const brand = document.querySelector('#brand');
brand.innerHTML = `
  <div class="brand-icon" aria-hidden="true">
    <div class="brand-frame"></div>
    <div class="brand-cut"></div>
  </div>
  <div class="brand-text">
    <span class="brand-top">${dashboardData.brand.top}</span>
    <span class="brand-bottom">${dashboardData.brand.bottom}</span>
  </div>
`;

const sidebarActions = document.querySelector('#sidebar-actions');
dashboardData.actions.forEach(({ label, className }) => {
  const button = document.createElement('button');
  button.className = `sidebar-btn ${className}`;
  button.textContent = label;
  sidebarActions.appendChild(button);
});

const menu = document.querySelector('#menu');
dashboardData.menuItems.forEach((item, index) => {
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = item;
  if (index === 0) link.classList.add('active');
  menu.appendChild(link);
});

const topbar = document.querySelector('#topbar');
topbar.innerHTML = `
  <div>
    <h1>${dashboardData.page.title}</h1>
    <p>${dashboardData.page.subtitle}</p>
  </div>
  <span class="period">${dashboardData.page.period}</span>
`;

const metricsContainer = document.querySelector('#metrics');
dashboardData.metrics.forEach(({ label, value, trend }) => {
  const card = document.createElement('article');
  card.className = 'card metric-card';
  card.innerHTML = `<span class="metric-label">${label}</span><strong class="metric-value">${value}</strong><span class="metric-trend">${trend}</span>`;
  metricsContainer.appendChild(card);
});

document.querySelector('#finance').innerHTML = `<h2>Resumo Financeiro</h2><div class="inline-stats">${dashboardData.financeStats.map(({ label, value }) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>`;
document.querySelector('#deadlines').innerHTML = `<h2>Próximos Prazos</h2><ul class="list">${dashboardData.deadlines.map(([project, date]) => `<li><span>${project}</span><strong>${date}</strong></li>`).join('')}</ul>`;
document.querySelector('#featured-project').innerHTML = `<div class="title-row"><h2>${dashboardData.featured.title}</h2><span class="badge">${dashboardData.featured.status}</span></div><p>${dashboardData.featured.description}</p><div class="actions">${dashboardData.featured.actions.map((label, index) => `<button class="${index === 0 ? 'ghost' : ''}">${label}</button>`).join('')}</div>`;
