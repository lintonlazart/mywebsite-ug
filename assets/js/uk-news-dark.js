// UK News Dark Theme - JavaScript
// Handles theme toggle, news loading, and interactivity

(function() {
    'use strict';

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const sunIcon = document.getElementById('sunIcon');
    
    // Load saved theme preference or default to dark
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    // Update theme icon visibility
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // ===== Time Formatting =====
    function formatTimeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return past.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    // ===== News Loading =====
    async function loadNews() {
        try {
            const response = await fetch('/uk-news-data.json');
            if (!response.ok) throw new Error('Failed to load news data');
            
            const data = await response.json();
            renderHero(data.articles[0]);
            renderMiniList(data.articles.slice(1, 5));
            renderGrid(data.articles.slice(5));
            updateTimestamp(data.generatedAt || data.updated);
        } catch (error) {
            console.error('Error loading news:', error);
            showError('Unable to load news. Please refresh the page.');
        }
    }

    // ===== Render Hero Section =====
    function renderHero(article) {
        if (!article) return;
        
        const heroImage = document.getElementById('heroImage');
        const heroTitle = document.getElementById('heroTitle');
        const heroSummary = document.getElementById('heroSummary');
        const heroSource = document.getElementById('heroSource');
        const heroTime = document.getElementById('heroTime');
        const heroLink = document.getElementById('heroLink');
        
        if (heroImage) {
            heroImage.src = article.urlToImage || 'https://via.placeholder.com/800x400/667eea/ffffff?text=UK+News';
            heroImage.alt = article.title;
            heroImage.onerror = function() {
                this.src = 'https://via.placeholder.com/800x400/667eea/ffffff?text=UK+News';
            };
        }
        
        if (heroTitle) heroTitle.textContent = article.title;
        if (heroSummary) heroSummary.textContent = article.description || article.title;
        if (heroSource) heroSource.textContent = article.source?.name || 'UK News';
        if (heroTime) heroTime.textContent = formatTimeAgo(article.publishedAt);
        
        if (heroLink) {
            heroLink.href = article.url;
            heroLink.setAttribute('target', '_blank');
            heroLink.setAttribute('rel', 'noopener noreferrer');
        }
    }

    // ===== Render Mini Headlines =====
    function renderMiniList(articles) {
        const miniList = document.getElementById('miniList');
        if (!miniList || !articles) return;
        
        miniList.innerHTML = '<h3>More Top Headlines</h3>';
        
        articles.forEach(article => {
            const item = document.createElement('a');
            item.href = article.url;
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
            item.className = 'mini-item';
            
            const title = document.createElement('div');
            title.className = 'mini-title';
            title.textContent = article.title;
            
            const meta = document.createElement('div');
            meta.className = 'mini-meta';
            meta.textContent = `${article.source?.name || 'UK News'} • ${formatTimeAgo(article.publishedAt)}`;
            
            item.appendChild(title);
            item.appendChild(meta);
            miniList.appendChild(item);
        });
    }

    // ===== Render News Grid =====
    function renderGrid(articles) {
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid || !articles) return;
        
        newsGrid.innerHTML = '';
        
        articles.forEach(article => {
            const card = createNewsCard(article);
            newsGrid.appendChild(card);
        });
    }

    // ===== Create News Card =====
    function createNewsCard(article) {
        const card = document.createElement('article');
        card.className = 'news-card';
        
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x250/667eea/ffffff?text=UK+News';
        
        card.innerHTML = `
            <img 
                src="${imageUrl}" 
                alt="${article.title}"
                class="news-thumbnail"
                onerror="this.src='https://via.placeholder.com/400x250/667eea/ffffff?text=UK+News'"
            >
            <div class="news-body">
                <h3 class="news-headline">${article.title}</h3>
                <p class="news-summary">${article.description || article.title}</p>
                <div class="news-meta">
                    <span class="news-source">${article.source?.name || 'UK News'}</span>
                    <span class="news-time">${formatTimeAgo(article.publishedAt)}</span>
                </div>
                <a 
                    href="${article.url}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="news-link"
                >
                    Read Full Article
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </a>
            </div>
        `;
        
        return card;
    }

    // ===== Update Timestamp =====
    function updateTimestamp(timestamp) {
        const updatedAt = document.getElementById('updatedAt');
        if (updatedAt && timestamp) {
            const date = new Date(timestamp);
            updatedAt.textContent = `Last updated: ${date.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
    }

    // ===== Show Error =====
    function showError(message) {
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            newsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="color: var(--accent); font-size: 1.25rem; margin-bottom: 1rem;">⚠️ ${message}</p>
                    <button onclick="location.reload()" class="btn btn-accent">Refresh Page</button>
                </div>
            `;
        }
    }

    // ===== Subscribe Modal =====
    const subscribeBtn = document.getElementById('subscribeBtn');
    const modal = document.getElementById('subscribeModal');
    const modalClose = document.getElementById('modalClose');
    const subscribeForm = document.getElementById('subscribeForm');
    
    if (subscribeBtn && modal) {
        subscribeBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (modalClose && modal) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput').value;
            
            // Here you would normally send to your backend
            alert(`Thank you for subscribing with ${email}! We'll keep you updated.`);
            modal.classList.remove('active');
            subscribeForm.reset();
        });
    }

    // ===== Refresh Button =====
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // ===== Initialize =====
    function init() {
        loadTheme();
        loadNews();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
