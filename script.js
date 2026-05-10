// Projeto Corte - JavaScript
// Handles charts, interactions, and page functionality

document.addEventListener('DOMContentLoaded', () => {
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

  // Validate form
  const form = e.target;
  const formData = new FormData(form);

  // Log form data (in production, send to server)
  console.log('Form submitted:', Object.fromEntries(formData));

  // Show success message
  showNotification('Proposta enviada com sucesso! Nossa equipe entrará em contato em breve.', 'success');

  // Reset form
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