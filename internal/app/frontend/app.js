// API Base URL
const API_BASE = '/api/v1';

// State
let availableTags = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTags();
    loadQuotes();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('quote-form');
    const tagSelect = document.getElementById('tag-select');
    const customTag = document.getElementById('custom-tag');
    const filterTag = document.getElementById('filter-tag');
    const refreshBtn = document.getElementById('refresh-btn');

    form.addEventListener('submit', handleGenerateQuote);
    
    tagSelect.addEventListener('change', () => {
        if (tagSelect.value) {
            customTag.value = '';
        }
    });

    customTag.addEventListener('input', () => {
        if (customTag.value) {
            tagSelect.value = '';
        }
    });

    filterTag.addEventListener('change', () => {
        loadQuotes(filterTag.value);
    });

    refreshBtn.addEventListener('click', () => {
        loadQuotes(filterTag.value);
    });
}

// Load available tags
async function loadTags() {
    try {
        const response = await fetch(`${API_BASE}/tags`);
        const data = await response.json();
        
        availableTags = data.tags || [];
        
        const tagSelect = document.getElementById('tag-select');
        const filterTag = document.getElementById('filter-tag');
        
        availableTags.forEach(tag => {
            const option1 = document.createElement('option');
            option1.value = tag;
            option1.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            tagSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = tag;
            option2.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
            filterTag.appendChild(option2);
        });
    } catch (error) {
        console.error('Error loading tags:', error);
        showError('Failed to load tags');
    }
}

// Handle quote generation
async function handleGenerateQuote(e) {
    e.preventDefault();
    
    const tagSelect = document.getElementById('tag-select');
    const customTag = document.getElementById('custom-tag');
    const requestor = document.getElementById('requestor');
    
    const tag = tagSelect.value || customTag.value.trim();
    
    if (!tag) {
        showError('Please select or enter a tag');
        return;
    }
    
    if (tag.length > 50) {
        showError('Tag must be 50 characters or less');
        return;
    }
    
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    
    // Show loading state
    generateBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    hideError();
    hideNewQuote();
    
    try {
        const response = await fetch(`${API_BASE}/quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tag: tag,
                requestor: requestor.value.trim() || undefined,
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate quote');
        }
        
        // Show the new quote
        showNewQuote(data);
        
        // Reload quotes list
        setTimeout(() => {
            loadQuotes();
        }, 500);
        
        // Reset form
        tagSelect.value = '';
        customTag.value = '';
        
    } catch (error) {
        console.error('Error generating quote:', error);
        showError(error.message || 'Failed to generate quote. Please try again.');
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Load quotes from API
async function loadQuotes(tag = '') {
    const quotesList = document.getElementById('quotes-list');
    quotesList.innerHTML = '<p class="loading">Loading quotes...</p>';
    
    try {
        const url = tag 
            ? `${API_BASE}/quotes?tag=${encodeURIComponent(tag)}&limit=20`
            : `${API_BASE}/quotes?limit=20`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to load quotes');
        }
        
        displayQuotes(data.quotes || []);
    } catch (error) {
        console.error('Error loading quotes:', error);
        quotesList.innerHTML = '<p class="error">Failed to load quotes. Please try again.</p>';
    }
}

// Display quotes in the list
function displayQuotes(quotes) {
    const quotesList = document.getElementById('quotes-list');
    
    if (quotes.length === 0) {
        quotesList.innerHTML = '<p class="no-quotes">No quotes found. Generate your first quote!</p>';
        return;
    }
    
    quotesList.innerHTML = '';
    
    quotes.forEach(quote => {
        const quoteCard = createQuoteCard(quote);
        quotesList.appendChild(quoteCard);
    });
}

// Create a quote card element
function createQuoteCard(quote) {
    const card = document.createElement('div');
    card.className = 'quote-card';
    
    const quoteText = document.createElement('p');
    quoteText.className = 'quote-text';
    quoteText.textContent = `"${quote.quote}"`;
    
    const quoteMeta = document.createElement('div');
    quoteMeta.className = 'quote-meta';
    
    const tag = document.createElement('span');
    tag.className = 'quote-tag';
    tag.textContent = quote.tag;
    
    const date = document.createElement('span');
    date.className = 'quote-date';
    date.textContent = formatDate(quote.created_at);
    
    quoteMeta.appendChild(tag);
    quoteMeta.appendChild(date);
    
    card.appendChild(quoteText);
    card.appendChild(quoteMeta);
    
    return card;
}

// Show new quote in highlighted section
function showNewQuote(quote) {
    const newQuoteDiv = document.getElementById('new-quote');
    newQuoteDiv.innerHTML = `
        <h3>✨ Your New Quote</h3>
        <p class="quote-text">"${quote.quote}"</p>
        <div class="quote-meta">
            <span class="quote-tag">${quote.tag}</span>
            <span class="quote-source">Generated by ${quote.source}</span>
        </div>
    `;
    newQuoteDiv.style.display = 'block';
}

// Hide new quote section
function hideNewQuote() {
    const newQuoteDiv = document.getElementById('new-quote');
    newQuoteDiv.style.display = 'none';
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Hide error message
function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}
