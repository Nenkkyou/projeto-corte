const metricData = [
  { label: 'Total de Projetos', value: 128 },
  { label: 'Em Orçamento', value: 21 },
  { label: 'Em Desenvolvimento', value: 34 },
  { label: 'Aprovados', value: 18 },
  { label: 'Em Produção', value: 27 },
  { label: 'Entregues', value: 28 }
];

const metrics = document.getElementById('metrics');

metricData.forEach((item) => {
  const card = document.createElement('article');
  card.className = 'metric';
  card.innerHTML = `<small>${item.label}</small><strong>${item.value}</strong>`;
  metrics.appendChild(card);
});
