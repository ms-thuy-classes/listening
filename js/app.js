// =========================================
// STATE MANAGEMENT
// =========================================
let lessons = [];
let currentPage = 1;
const itemsPerPage = 10;
let activeCategory = 'All';
let searchQuery = '';

// =========================================
// CATEGORIES DEFINITION
// =========================================
const categories = [
    "All", "A1", "A2", "B1", "B2", "C1", "C2", "Complete IELTS",
    "Cambridge 10", "Cambridge 11", "Cambridge 12", "Cambridge 13", 
    "Cambridge 14", "Cambridge 15", "Cambridge 16", "Cambridge 17", 
    "Cambridge 18", "Cambridge 19", "Cambridge 20"
];

// =========================================
// INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    renderCategories();
    await fetchLessons();
    setupEventListeners();
});

// =========================================
// DATA FETCHING
// =========================================
async function fetchLessons() {
    try {
        const response = await fetch('data/lessons.json');
        if (!response.ok) throw new Error('Failed to load lessons');
        lessons = await response.json();
        renderLessons();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('lessons-grid').innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Failed to load lessons. Please check data/lessons.json</p>';
    }
}

// =========================================
// RENDERING
// =========================================
function renderCategories() {
    const container = document.getElementById('category-container');
    container.innerHTML = categories.map(cat => `
        <button class="pill ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
            ${cat}
        </button>
    `).join('');
}

function renderLessons() {
    const grid = document.getElementById('lessons-grid');
    const emptyState = document.getElementById('empty-state');
    const pagination = document.getElementById('pagination');

    // Filter logic
    const filtered = lessons.filter(lesson => {
        const matchesSearch = 
            lesson.title.toLowerCase().includes(searchQuery) ||
            lesson.description.toLowerCase().includes(searchQuery) ||
            lesson.category.toLowerCase().includes(searchQuery) ||
            lesson.level.toLowerCase().includes(searchQuery);
        const matchesCategory = activeCategory === 'All' || lesson.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Empty state handling
    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        pagination.innerHTML = '';
        return;
    }
    emptyState.classList.add('hidden');

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedLessons = filtered.slice(start, end);

    // Render cards
    grid.innerHTML = paginatedLessons.map((lesson, index) => `
        <article class="lesson-card fade-in-up" style="animation-delay: ${index * 0.05}s">
            <div class="card-image">🎧</div>
            <div class="card-content">
                <div class="card-badges">
                    <span class="badge badge-category">${lesson.category}</span>
                    <span class="badge badge-level">${lesson.level}</span>
                </div>
                <h3 class="card-title">${lesson.title}</h3>
                <p class="card-desc">${lesson.description}</p>
                <div class="card-footer">
                    <span class="duration">⏱️ ${lesson.duration}</span>
                    <a href="${lesson.file}" class="btn-open">Open Lesson</a>
                </div>
            </div>
        </article>
    `).join('');

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-btn" disabled>...</span>`;
        }
    }
    
    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;
    container.innerHTML = html;
}

// =========================================
// EVENT LISTENERS
// =========================================
function setupEventListeners() {
    // Category Filter
    document.getElementById('category-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('pill')) {
            activeCategory = e.target.dataset.category;
            currentPage = 1;
            renderCategories();
            renderLessons();
        }
    });

    // Search (Debounced)
    let timeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderLessons();
        }, 300);
    });

    // Pagination
    document.getElementById('pagination').addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn') && !e.target.disabled) {
            currentPage = parseInt(e.target.dataset.page);
            renderLessons();
            document.getElementById('lessons-section').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Dark Mode Toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Back to Top
    const backToTop = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// =========================================
// THEME MANAGEMENT
// =========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}
