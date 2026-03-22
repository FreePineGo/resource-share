// Search functionality
let fuse = null;
let searchData = null;

// Initialize Fuse.js
async function initSearch() {
  try {
    const response = await fetch(window.location.pathname.includes('/category/') ? '../js/search-data.json' : 'js/search-data.json');
    searchData = await response.json();

    // Filter by category if on category page
    const categoryData = typeof currentCategory !== 'undefined'
      ? searchData.filter(item => item.category === currentCategory)
      : searchData;

    fuse = new Fuse(categoryData, {
      keys: ['name', 'description', 'note'],
      threshold: 0.3,
      ignoreLocation: true
    });
  } catch (e) {
    console.log('Search data not available');
  }
}

// Handle search input
function handleSearch(query) {
  const resultsContainer = document.getElementById('searchResults');

  if (!query.trim() || !fuse) {
    resultsContainer.classList.remove('active');
    return;
  }

  const results = fuse.search(query).slice(0, 10);

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="search-result-item">未找到相关资源</div>';
  } else {
    resultsContainer.innerHTML = results.map(result => {
      const item = result.item;
      const link = window.location.pathname.includes('/category/')
        ? `../category/${item.category}.html`
        : `category/${item.category}.html`;
      return `
        <div class="search-result-item" onclick="window.location.href='${link}'">
          <strong>${item.name}</strong>
          <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;">${item.categoryName}</span>
        </div>
      `;
    }).join('');
  }

  resultsContainer.classList.add('active');
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
  const searchBox = document.querySelector('.search-box');
  const resultsContainer = document.getElementById('searchResults');
  if (searchBox && resultsContainer && !searchBox.contains(e.target)) {
    resultsContainer.classList.remove('active');
  }
});

// Modal functionality
function openModal(index) {
  const item = resources[index];
  const modal = document.getElementById('modalOverlay');
  const cover = document.getElementById('modalCover');
  const title = document.getElementById('modalTitle');
  const info = document.getElementById('modalInfo');
  const desc = document.getElementById('modalDesc');
  const link = document.getElementById('modalLink');

  // Cover
  if (item.cover) {
    const coverPath = window.location.pathname.includes('/category/')
      ? (item.cover.startsWith('http') ? item.cover : '../' + item.cover)
      : item.cover;
    cover.innerHTML = `<img src="${coverPath}" alt="${item.name}">`;
  } else {
    cover.innerHTML = `<span class="modal-icon">${item.icon || '📦'}</span>`;
  }

  // Title
  title.textContent = item.name;

  // Info
  let infoHtml = '';
  if (item.categoryName) infoHtml += `<span class="modal-info-label">分类:</span><span class="modal-info-value">${item.categoryName}</span>`;
  if (item.size) infoHtml += `<span class="modal-info-label">大小:</span><span class="modal-info-value">${item.size}</span>`;
  if (item.version) infoHtml += `<span class="modal-info-label">版本:</span><span class="modal-info-value">${item.version}</span>`;
  if (item.updateTime) infoHtml += `<span class="modal-info-label">更新:</span><span class="modal-info-value">${item.updateTime}</span>`;
  info.innerHTML = infoHtml;

  // Description
  desc.textContent = item.description || '暂无简介';

  // Link
  let linkHtml = `<a href="${item.link}" class="modal-btn" target="_blank">获取链接</a>`;
  if (item.code) linkHtml += `<span class="code-display">提取码: ${item.code}</span>`;
  link.innerHTML = linkHtml;

  // Show modal
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.classList.remove('modal-open');
}

function closeModalOnOverlay(event) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Pagination
function initPagination() {
  if (typeof totalPages === 'undefined' || totalPages <= 1) return;

  const container = document.getElementById('pagination');
  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get('page')) || 1;

  showPage(currentPage);

  let html = '';
  html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
  container.innerHTML = html;
}

function showPage(page) {
  const cards = document.querySelectorAll('.resource-card');
  cards.forEach(card => {
    const cardPage = parseInt(card.dataset.page);
    card.style.display = cardPage === page ? 'block' : 'none';
  });
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  window.history.pushState({}, '', url);
  showPage(page);
  initPagination();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('nav').classList.toggle('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  initPagination();
});