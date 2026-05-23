// Projeto Corte - JavaScript
// Handles charts, interactions, and page functionality

// --- Auth ---
const AUTH_KEY = 'pc_auth';
const CREDENTIALS = { username: 'admin', password: 'projetocorte2024' };

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
  const events = JSON.parse(localStorage.getItem('pc_events') || '[]');
  events.push({ id: genId(), type, detail, timestamp: new Date().toISOString() });
  if (events.length > 500) events.splice(0, events.length - 500);
  localStorage.setItem('pc_events', JSON.stringify(events));
}

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
// --- End Tracking ---

// Captura erros JS globais
window.onerror = function(message, source, lineno) {
  trackEvent('js_error', `${message} (${source}:${lineno})`);
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
      description: formData.get('description'),
      timeline: formData.get('timeline'),
      budget: formData.get('budget'),
      requirements,
      contactMethod: formData.get('contactMethod'),
    },
  };

  const submissions = JSON.parse(localStorage.getItem('pc_submissions') || '[]');
  submissions.push(submission);
  localStorage.setItem('pc_submissions', JSON.stringify(submissions));
  trackEvent('form_submit', `${submission.clientName} — ${submission.data.projectName}`);

  showNotification('Proposta enviada com sucesso! Nossa equipe entrará em contato em breve.', 'success');
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
  console.log('Calendar navigation:', e.target);
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