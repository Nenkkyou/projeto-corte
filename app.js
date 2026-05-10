const menuItems = [
  'Dashboard',
  'Clientes',
  'Projetos',
  'Novo Projeto',
  'Biblioteca Técnica',
  'Lista de Corte',
  'Ferragens',
  'Orçamentos'
];

const metrics = [
  { label: 'Total de Projetos', value: 128, trend: '+9% no mês' },
  { label: 'Em Orçamento', value: 21, trend: '+3 novas propostas' },
  { label: 'Em Desenvolvimento', value: 34, trend: '12 com prazo crítico' },
  { label: 'Aprovados', value: 18, trend: '+5 esta semana' },
  { label: 'Em Produção', value: 27, trend: '4 entregas hoje' },
  { label: 'Entregues', value: 28, trend: '93% no prazo' }
];

const financeStats = [
  { label: 'Previsto', value: 'R$ 286.750,00' },
  { label: 'Confirmado', value: 'R$ 153.980,00' },
  { label: 'Ticket Médio', value: 'R$ 3.842,00' }
];

const deadlines = [
  ['Projeto Residencial Alpha', '15/05/2026'],
  ['Escritório Corporate', '22/05/2026'],
  ['Closet Master Suite', '29/05/2026']
];

const menu = document.querySelector('#menu');
menuItems.forEach((item, index) => {
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = item;
  if (index === 0) link.classList.add('active');
  menu.appendChild(link);
});

const metricsContainer = document.querySelector('#metrics');
metrics.forEach(({ label, value, trend }) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <span class="metric-label">${label}</span>
    <strong class="metric-value">${value}</strong>
    <span class="metric-trend">${trend}</span>
  `;
  metricsContainer.appendChild(card);
});

const finance = document.querySelector('#finance');
finance.innerHTML = '<h2>Resumo Financeiro</h2>';
const financeList = document.createElement('div');
financeList.className = 'inline-stats';
financeStats.forEach(({ label, value }) => {
  const item = document.createElement('div');
  item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  financeList.appendChild(item);
});
finance.appendChild(financeList);

const deadlinesCard = document.querySelector('#deadlines');
deadlinesCard.innerHTML = '<h2>Próximos Prazos</h2>';
const deadlineList = document.createElement('ul');
deadlineList.className = 'list';
deadlines.forEach(([project, date]) => {
  const item = document.createElement('li');
  item.innerHTML = `<span>${project}</span><strong>${date}</strong>`;
  deadlineList.appendChild(item);
});
deadlinesCard.appendChild(deadlineList);

const featured = document.querySelector('#featured-project');
featured.innerHTML = `
  <div class="title-row">
    <h2>Projeto Premium Residencial Alpha</h2>
    <span class="badge">Em Produção</span>
  </div>
  <p>Cliente: Carlos Menezes • Ambiente: Cozinha • Status: Em Produção • Entrega: 15/05/2026.</p>
  <div class="actions">
    <button class="ghost">Baixar PDF</button>
    <button>Gerar Orçamento</button>
    <button>Enviar para Produção</button>
  </div>
`;
