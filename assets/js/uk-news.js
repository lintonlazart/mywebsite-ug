/* ==========================================================================
   UK News Dark Theme - JavaScript
   ========================================================================== */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        newsDataUrl: '/uk-news-data.json',
        fallbackImage: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23071029" width="400" height="300"/%3E%3Ctext fill="%238892a6" font-family="Inter,sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E',
        refreshInterval: 3600000, // 1 hour
    };

    // State
    let newsData = null;

    // DOM Elements
    const elements = {
        heroImage: document.getElementById('heroImage'),
        heroTitle: document.getElementById('heroTitle'),
        heroSummary: document.getElementById('heroSummary'),
        heroSource: document.getElementById('heroSource'),
        heroTime: document.getElementById('heroTime'),
        heroLink: document.getElementById('heroLink'),
        miniList: document.getElementById('miniList'),
        newsGrid: document.getElementById('newsGrid'),
        updatedAt: document.getElementById('updatedAt'),
        subscribeBtn: document.getElementById('subscribeBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        subscribeModal: document.getElementById('subscribeModal'),
        modalClose: document.getElementById('modalClose'),
        subscribeForm: document.getElementById('subscribeForm'),
        emailInput: document.getElementById('emailInput'),
        formMessage: document.getElementById('formMessage'),
    };

    // Utility Functions
    function formatTimeAgo(dateString) {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    function handleImageError(img) {
        img.src = CONFIG.fallbackImage;
        img.alt = 'Image not available';
    }

    function truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    function sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Render Functions
    function renderHeroSection(article) {
        if (!article) return;

        elements.heroImage.src = article.urlToImage || CONFIG.fallbackImage;
        elements.heroImage.alt = sanitizeHTML(article.title || '');
        elements.heroImage.onerror = function() { handleImageError(this); };

        elements.heroTitle.textContent = article.title || 'Untitled';
        elements.heroSummary.textContent = article.description || article.content || 'No summary available';
        elements.heroSource.textContent = article.source?.name || 'Unknown Source';
        elements.heroTime.textContent = formatTimeAgo(article.publishedAt);
        elements.heroTime.setAttribute('datetime', article.publishedAt);
        elements.heroLink.href = article.url || '#';
    }

    function createMiniItem(article) {
        const div = document.createElement('div');
        div.className = 'mini-item';
        div.onclick = () => window.open(article.url, '_blank', 'noopener,noreferrer');

        const title = document.createElement('h4');
        title.className = 'mini-item-title';
        title.textContent = article.title || 'Untitled';

        const meta = document.createElement('div');
        meta.className = 'mini-item-meta';

        const source = document.createElement('span');
        source.className = 'mini-item-source';
        source.textContent = article.source?.name || 'Unknown';

        const time = document.createElement('time');
        time.className = 'time-ago';
        time.textContent = formatTimeAgo(article.publishedAt);
        time.setAttribute('datetime', article.publishedAt);

        meta.appendChild(source);
        meta.appendChild(document.createTextNode(' • '));
        meta.appendChild(time);

        div.appendChild(title);
        div.appendChild(meta);

        return div;
    }

    function renderMiniList(articles) {
        elements.miniList.innerHTML = '';
        
        const miniArticles = articles.slice(1, 5); // Articles 1-4
        miniArticles.forEach(article => {
            elements.miniList.appendChild(createMiniItem(article));
        });
    }

    function createNewsCard(article) {
        const card = document.createElement('article');
        card.className = 'news-card';
        card.onclick = () => window.open(article.url, '_blank', 'noopener,noreferrer');

        const imageDiv = document.createElement('div');
        imageDiv.className = 'news-card-image';

        const img = document.createElement('img');
        img.src = article.urlToImage || CONFIG.fallbackImage;
        img.alt = sanitizeHTML(article.title || '');
        img.loading = 'lazy';
        img.onerror = function() { handleImageError(this); };

        imageDiv.appendChild(img);

        const content = document.createElement('div');
        content.className = 'news-card-content';

        const title = document.createElement('h3');
        title.className = 'news-card-title';
        title.textContent = article.title || 'Untitled';

        const summary = document.createElement('p');
        summary.className = 'news-card-summary';
        summary.textContent = article.description || article.content || 'No summary available';

        const meta = document.createElement('div');
        meta.className = 'news-card-meta';

        const source = document.createElement('span');
        source.className = 'news-card-source';
        source.textContent = article.source?.name || 'Unknown';

        const time = document.createElement('time');
        time.className = 'news-card-time';
        time.textContent = formatTimeAgo(article.publishedAt);
        time.setAttribute('datetime', article.publishedAt);

        meta.appendChild(source);
        meta.appendChild(time);

        content.appendChild(title);
        content.appendChild(summary);
        content.appendChild(meta);

        card.appendChild(imageDiv);
        card.appendChild(content);

        return card;
    }

    function renderNewsGrid(articles) {
        elements.newsGrid.innerHTML = '';
        
        const gridArticles = articles.slice(5); // Remaining articles after hero + mini list
        gridArticles.forEach(article => {
            elements.newsGrid.appendChild(createNewsCard(article));
        });
    }

    function renderUpdatedTime() {
        const now = new Date();
        elements.updatedAt.textContent = now.toLocaleString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        elements.updatedAt.setAttribute('datetime', now.toISOString());
    }

    // Data Loading
    async function loadNewsData() {
        try {
            // Show loading state
            elements.newsGrid.innerHTML = '<div class="loading">Loading latest news...</div>';

            const response = await fetch(CONFIG.newsDataUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.articles || !Array.isArray(data.articles)) {
                throw new Error('Invalid data format');
            }

            newsData = data.articles.filter(article => 
                article && 
                article.title && 
                article.title !== '[Removed]' &&
                article.url
            );

            if (newsData.length === 0) {
                throw new Error('No valid articles found');
            }

            renderAll();
            
        } catch (error) {
            console.error('Error loading news:', error);
            elements.newsGrid.innerHTML = `
                <div class="loading" style="color: var(--accent);">
                    Unable to load news. Please try again later.
                </div>
            `;
        }
    }

    function renderAll() {
        if (!newsData || newsData.length === 0) return;

        renderHeroSection(newsData[0]);
        renderMiniList(newsData);
        renderNewsGrid(newsData);
        renderUpdatedTime();
    }

    // Modal Functions
    function openModal() {
        elements.subscribeModal.classList.add('active');
        elements.subscribeModal.setAttribute('aria-hidden', 'false');
        elements.emailInput.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        elements.subscribeModal.classList.remove('active');
        elements.subscribeModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        elements.formMessage.textContent = '';
        elements.formMessage.className = 'form-message';
    }

    function showMessage(message, type = 'success') {
        elements.formMessage.textContent = message;
        elements.formMessage.className = `form-message ${type}`;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async function handleSubscribe(e) {
        e.preventDefault();

        const email = elements.emailInput.value.trim();

        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Simulate subscription (replace with actual API call)
        try {
            showMessage('Processing...', 'success');
            
            // TODO: Replace with actual API call
            // const response = await fetch('/api/subscribe', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email }),
            // });

            await new Promise(resolve => setTimeout(resolve, 1000));

            showMessage('✓ Successfully subscribed! Check your email.', 'success');
            elements.subscribeForm.reset();

            setTimeout(() => {
                closeModal();
            }, 2000);

        } catch (error) {
            console.error('Subscription error:', error);
            showMessage('Failed to subscribe. Please try again.', 'error');
        }
    }

    // Event Listeners
    function initEventListeners() {
        // Subscribe button
        elements.subscribeBtn?.addEventListener('click', openModal);

        // Refresh button
        elements.refreshBtn?.addEventListener('click', () => {
            elements.refreshBtn.style.animation = 'spin 0.5s ease';
            setTimeout(() => {
                elements.refreshBtn.style.animation = '';
            }, 500);
            loadNewsData();
        });

        // Modal close
        elements.modalClose?.addEventListener('click', closeModal);
        elements.subscribeModal?.querySelector('.modal-overlay')?.addEventListener('click', closeModal);

        // Subscribe form
        elements.subscribeForm?.addEventListener('submit', handleSubscribe);

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.subscribeModal.classList.contains('active')) {
                closeModal();
            }
        });

        // Auto-refresh (optional)
        setInterval(() => {
            loadNewsData();
        }, CONFIG.refreshInterval);
    }

    // Add spin animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Initialize
    function init() {
        initEventListeners();
        loadNewsData();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
