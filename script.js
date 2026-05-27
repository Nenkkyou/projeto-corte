// Projeto Corte - JavaScript
// Handles charts, interactions, and page functionality

// --- Auth ---
const AUTH_KEY = 'pc_auth';
const CREDENTIALS = { username: 'admin', password: 'projetocorte2024' };
const CLIENT_SESSION_KEY = 'pc_client_session';
const DEV_SESSION_KEY = 'pc_dev_session';

async function registerClient(name, email, password) {
  try {
    const users = JSON.parse(localStorage.getItem('pc_users') || '[]');
    if (users.find(u => u.email === email)) return { ok: false, error: 'Email já cadastrado.' };
    const passwordHash = await hashPassword(password);
    const user = { name, email, passwordHash, createdAt: new Date().toISOString() };
    users.push(user);
    localStorage.setItem('pc_users', JSON.stringify(users));
    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify({ name, email, loginAt: new Date().toISOString() }));
    trackEvent('client_register', email);
    return { ok: true };
  } catch (_) {
    return { ok: false, error: 'Erro ao acessar armazenamento local.' };
  }
}

async function loginClient(email, password) {
  try {
    const users = JSON.parse(localStorage.getItem('pc_users') || '[]');
    const user = users.find(u => u.email === email);
    if (!user) { trackEvent('client_login_fail', email); return { ok: false, error: 'Email não encontrado.' }; }
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) { trackEvent('client_login_fail', email); return { ok: false, error: 'Senha incorreta.' }; }
    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify({ name: user.name, email, loginAt: new Date().toISOString() }));
    trackEvent('client_login', email);
    return { ok: true };
  } catch (_) {
    return { ok: false, error: 'Erro ao acessar armazenamento local.' };
  }
}

async function handleCadastroSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const tab = form.dataset.tab;
  const errorEl = document.getElementById('cadastroError');
  errorEl.style.display = 'none';

  if (tab === 'register') {
    const name = form.querySelector('#regName').value.trim();
    const email = form.querySelector('#regEmail').value.trim();
    const password = form.querySelector('#regPassword').value;
    if (password.length < 6) { errorEl.textContent = 'Senha deve ter no mínimo 6 caracteres.'; errorEl.style.display = 'flex'; return; }
    const result = await registerClient(name, email, password);
    if (!result.ok) { errorEl.textContent = result.error; errorEl.style.display = 'flex'; return; }
  } else {
    const email = form.querySelector('#loginEmail').value.trim();
    const password = form.querySelector('#loginPassword').value;
    const result = await loginClient(email, password);
    if (!result.ok) { errorEl.textContent = result.error; errorEl.style.display = 'flex'; return; }
  }
  window.location.href = 'proposta.html';
}

function checkAuth() {
  if (!localStorage.getItem(AUTH_KEY)) {
    window.location.href = 'login.html';
  }
}

function logout() {
  trackEvent('admin_logout', '');
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
    localStorage.setItem(AUTH_KEY, '1');
    trackEvent('admin_login', username);
    window.location.href = 'dashboard.html';
  } else {
    trackEvent('admin_login_fail', username);
    errorEl.style.display = 'flex';
    document.getElementById('password').value = '';
  }
}
// --- Tracking ---
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function trackEvent(type, detail = '') {
  try {
    const events = JSON.parse(localStorage.getItem('pc_events') || '[]');
    events.push({ id: genId(), type, detail, timestamp: new Date().toISOString() });
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem('pc_events', JSON.stringify(events));
  } catch (_) {}
}

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// --- End Tracking ---

// Captura erros JS globais
window.onerror = function(message, source, lineno, colno, error) {
  const stack = error && error.stack ? error.stack.slice(0, 200) : '';
  trackEvent('js_error', `${message} (${source}:${lineno}) ${stack}`);
};

// Page view automático
trackEvent('page_view', window.location.pathname.split('/').pop() || 'index.html');

document.addEventListener('DOMContentLoaded', () => {
  // Login page
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    // Redirect already-logged-in users
    if (localStorage.getItem(AUTH_KEY)) {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  // Cadastro page
  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    if (localStorage.getItem(CLIENT_SESSION_KEY)) {
      window.location.href = 'proposta.html';
      return;
    }
    document.querySelectorAll('.cadastro-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.cadastro-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.cadastro-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('panel-' + tab).classList.add('active');
        cadastroForm.dataset.tab = tab;
        document.getElementById('cadastroError').style.display = 'none';
      });
    });
    cadastroForm.dataset.tab = 'login';
    cadastroForm.addEventListener('submit', handleCadastroSubmit);
    return;
  }

  // DEV login
  const devLoginForm = document.getElementById('devLoginForm');
  if (devLoginForm) {
    if (localStorage.getItem(DEV_SESSION_KEY)) {
      window.location.replace('dev.html');
      return;
    }
    devLoginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const password = document.getElementById('devPassword').value;
      const errorEl = document.getElementById('devLoginError');
      if (password === 'KuroNeko@97') {
        localStorage.setItem(DEV_SESSION_KEY, '1');
        trackEvent('dev_login', 'success');
        window.location.replace('dev.html');
      } else {
        trackEvent('dev_login_fail', 'wrong password');
        if (errorEl) errorEl.textContent = 'Senha incorreta.';
      }
    });
    return;
  }

  // Initialize charts if on dashboard page
  if (document.getElementById('envChart')) {
    initializeCharts();
  }

  // Set current date range
  updateDateRange();

  // Form handling
  const form = document.querySelector('.proposal-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Search and filter functionality
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Calendar navigation
  const calendarNavButtons = document.querySelectorAll('.calendar-nav-btn');
  calendarNavButtons.forEach(button => {
    button.addEventListener('click', handleCalendarNavigation);
  });

  // Hamburger menu (landing page)
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileNavMenu');
  const mobileOverlay = document.getElementById('mobileNavOverlay');
  if (hamburger && mobileMenu && mobileOverlay) {
    function toggleMobileMenu(open) {
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('open', open);
      mobileOverlay.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    hamburger.addEventListener('click', function() {
      toggleMobileMenu(!hamburger.classList.contains('open'));
    });
    mobileOverlay.addEventListener('click', function() {
      toggleMobileMenu(false);
    });
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        toggleMobileMenu(false);
      });
    });
  }
});

/**
 * Initialize Chart.js charts
 */
function initializeCharts() {
  // Environment types chart (doughnut)
  const envCtx = document.getElementById('envChart');
  if (envCtx) {
    new Chart(envCtx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Cozinha', 'Sala', 'Quarto', 'Banheiro', 'Escritório'],
        datasets: [
          {
            label: 'Ambientes',
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              '#4CAF50',
              '#2563EB',
              '#D97706',
              '#DC2626',
              '#7C3AED',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#4b5563',
              font: {
                size: 12,
              },
              padding: 15,
            },
          },
        },
      },
    });
  }

  // Projects per month chart (line)
  const projCtx = document.getElementById('projectsChart');
  if (projCtx) {
    new Chart(projCtx.getContext('2d'), {
      type: 'line',
      data: {
        labels: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        datasets: [
          {
            label: 'Projetos',
            data: [5, 8, 12, 9, 15, 20, 18, 25, 22, 19, 14, 11],
            fill: true,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#4CAF50',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: '#4b5563',
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#4b5563',
            },
            grid: {
              color: '#e5e7eb',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }
}

/**
 * Update date range display
 */
function updateDateRange() {
  const dateRangeElement = document.getElementById('dateRange');
  if (dateRangeElement) {
    const today = new Date();
    const startDate = new Date(today.getTime() - (9 * 24 * 60 * 60 * 1000)); // 10 days ago
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    dateRangeElement.textContent = `${formatDate(startDate)} – ${formatDate(today)}`;
  }
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const session = JSON.parse(localStorage.getItem('pc_client_session') || '{}');

  const requirements = formData.getAll('requirement');
  const submission = {
    id: genId(),
    submittedAt: new Date().toISOString(),
    clientEmail: session.email || 'anônimo',
    clientName: session.name || 'anônimo',
    data: {
      projectName: formData.get('projectName'),
      projectType: formData.get('projectType'),
      environment: formData.get('environment'),
      area: formData.get('area'),
      description: (formData.get('description') || '').slice(0, 2000),
      timeline: formData.get('timeline'),
      budget: formData.get('budget'),
      requirements,
      contactMethod: formData.get('contactMethod'),
    },
  };

  try {
    const submissions = JSON.parse(localStorage.getItem('pc_submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('pc_submissions', JSON.stringify(submissions));
    trackEvent('form_submit', `${submission.clientName} — ${submission.data.projectName}`);
    showNotification('Proposta enviada com sucesso! Nossa equipe entrará em contato em breve.', 'success');
  } catch (_) {
    showNotification('Erro ao salvar proposta. Tente novamente.', 'error');
  }
  form.reset();
}

/**
 * Handle search functionality
 */
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

/**
 * Handle calendar navigation
 */
function handleCalendarNavigation(e) {
  // In a real app, this would update the calendar to show previous/next month
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === 'success' ? '#4CAF50' : '#2563EB'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Navigation functionality
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Add CSS animation for notifications
 */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Setup navigation on page load
setupNavigation();