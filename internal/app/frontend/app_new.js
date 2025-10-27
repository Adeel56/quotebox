// Theme Management
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
};

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Initialize
initTheme();

// State
let quoteHistory = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
let totalQuotes = parseInt(localStorage.getItem('totalQuotes') || '0');

// Update total quotes display
const updateTotalQuotes = () => {
    document.getElementById('totalQuotes').textContent = totalQuotes;
};

// Load available tags
const loadTags = async () => {
    try {
        const response = await fetch('/api/v1/tags');
        const data = await response.json();
        
        const select = document.getElementById('tagSelect');
        data.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load tags:', error);
    }
};

// Format time ago
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    
    return 'Just now';
};

// Show loading overlay
const showLoading = () => {
    document.getElementById('loadingOverlay').classList.add('active');
};

// Hide loading overlay
const hideLoading = () => {
    document.getElementById('loadingOverlay').classList.remove('active');
};

// Display quote
const displayQuote = (quote) => {
    const quoteCard = document.getElementById('quoteCard');
    document.getElementById('quoteTag').textContent = quote.tag;
    document.getElementById('quoteTime').textContent = `${quote.latency_ms}ms`;
    document.getElementById('quoteText').textContent = `"${quote.quote_text}"`;
    document.getElementById('quoteAuthor').textContent = `— ${quote.author}`;
    
    quoteCard.style.display = 'block';
    quoteCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Add to history
const addToHistory = (quote) => {
    quoteHistory.unshift({
        ...quote,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10
    if (quoteHistory.length > 10) {
        quoteHistory = quoteHistory.slice(0, 10);
    }
    
    localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory));
    renderHistory();
    
    totalQuotes++;
    localStorage.setItem('totalQuotes', totalQuotes.toString());
    updateTotalQuotes();
};

// Render history
const renderHistory = () => {
    const historyContainer = document.getElementById('quoteHistory');
    
    if (quoteHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="8" y="8" width="32" height="32" rx="4"/>
                    <line x1="16" y1="18" x2="32" y2="18"/>
                    <line x1="16" y1="24" x2="32" y2="24"/>
                    <line x1="16" y1="30" x2="24" y2="30"/>
                </svg>
                <p>No quotes generated yet</p>
                <p class="text-muted">Start by generating your first quote above</p>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = quoteHistory.map(quote => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-item-tag">${quote.tag}</span>
                <span class="history-item-time">${timeAgo(quote.timestamp)}</span>
            </div>
            <div class="history-item-text">"${quote.quote_text}"</div>
            <div class="history-item-author">— ${quote.author}</div>
        </div>
    `).join('');
};

// Clear history
const clearHistory = () => {
    if (confirm('Are you sure you want to clear all quote history?')) {
        quoteHistory = [];
        localStorage.setItem('quoteHistory', '[]');
        renderHistory();
    }
};

// Copy quote
const copyQuote = () => {
    const quoteText = document.getElementById('quoteText').textContent;
    const quoteAuthor = document.getElementById('quoteAuthor').textContent;
    const fullQuote = `${quoteText}\n${quoteAuthor}`;
    
    navigator.clipboard.writeText(fullQuote).then(() => {
        // Show feedback
        const btn = event.target.closest('.btn-icon');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    });
};

// Share quote
const shareQuote = () => {
    const quoteText = document.getElementById('quoteText').textContent;
    const quoteAuthor = document.getElementById('quoteAuthor').textContent;
    const fullQuote = `${quoteText} ${quoteAuthor}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'QuoteBox',
            text: fullQuote,
            url: window.location.href
        });
    } else {
        copyQuote();
    }
};

// Generate quote
document.getElementById('generateBtn')?.addEventListener('click', async () => {
    const selectedTag = document.getElementById('tagSelect').value;
    const customTag = document.getElementById('customTag').value.trim();
    
    const tag = customTag || selectedTag;
    
    if (!tag) {
        alert('Please select or enter a tag');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/v1/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tag })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate quote');
        }
        
        const data = await response.json();
        displayQuote(data);
        addToHistory(data);
        
        // Clear inputs
        document.getElementById('tagSelect').value = '';
        document.getElementById('customTag').value = '';
        
    } catch (error) {
        alert('Failed to generate quote. Please try again.');
        console.error(error);
    } finally {
        hideLoading();
    }
});

// Clear custom tag when select changes
document.getElementById('tagSelect')?.addEventListener('change', () => {
    if (document.getElementById('tagSelect').value) {
        document.getElementById('customTag').value = '';
    }
});

// Clear select when custom tag is entered
document.getElementById('customTag')?.addEventListener('input', () => {
    if (document.getElementById('customTag').value) {
        document.getElementById('tagSelect').value = '';
    }
});

// Initialize
updateTotalQuotes();
loadTags();
renderHistory();

// Make functions global
window.copyQuote = copyQuote;
window.shareQuote = shareQuote;
window.clearHistory = clearHistory;
