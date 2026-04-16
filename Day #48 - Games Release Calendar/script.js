// ============================================
// CONFIGURATION - Get your free API key below!
// ============================================
// Visit: https://rawg.io/apidocs
// 1. Create a free account at RAWG.io
// 2. Go to "API Key" section in your profile
// 3. Copy your API key and replace below:
const API_KEY = 'YOUR_RAWG_API_KEY_HERE';

// ============================================
// APPLICATION STATE
// ============================================
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let isLoading = false;

// DOM Elements
const calendarEl = document.getElementById('calendar');
const monthYearEl = document.getElementById('currentMonthYear');
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');
const modal = document.getElementById('gameModal');

// Month names for display
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Strip HTML tags from string for safe display
 */
function stripHtmlTags(input) {
    if (!input) return "No description available.";
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || "No description available.";
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    if (!dateString) return "TBA";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Show loading spinner
 */
function showLoading() {
    isLoading = true;
    calendarEl.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading games...</p>
        </div>
    `;
}

/**
 * Show error message
 */
function showError(message) {
    calendarEl.innerHTML = `
        <div class="error-container">
            <span class="error-icon">⚠️</span>
            <p>${message}</p>
            <button onclick="fetchGamesForMonth(currentYear, currentMonth)">Try Again</button>
        </div>
    `;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch games for a given month from RAWG API
 */
async function fetchGamesForMonth(year, month) {
    // Validate API key
    if (API_KEY === 'YOUR_RAWG_API_KEY_HERE' || !API_KEY) {
        showError('⚠️ Please add your RAWG API key in script.js<br><small>Get free key at: https://rawg.io/apidocs</small>');
        return;
    }

    // Update navigation button visibility
    const now = new Date();
    const currentMonthOnly = now.getMonth();
    const currentYearOnly = now.getFullYear();
    
    prevBtn.style.display = (month <= currentMonthOnly - 1 && year === currentYearOnly) ? 'none' : 'block';
    nextBtn.style.display = (month >= currentMonthOnly + 1 && year === currentYearOnly) ? 'none' : 'block';

    showLoading();

    try {
        // Calculate date range for the month
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const response = await fetch(
            `https://api.rawg.io/api/games?dates=${startDate},${endDate}&key=${API_KEY}&page_size=50`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter games with valid images
        const games = data.results.filter(game => game.background_image);
        
        // Group games by day
        renderCalendar(year, month, games);
        
    } catch (error) {
        console.error('Fetch error:', error);
        showError(`Failed to load games: ${error.message}`);
    } finally {
        isLoading = false;
    }
}

/**
 * Fetch detailed game information
 */
async function fetchGameDetails(gameId) {
    try {
        const response = await fetch(
            `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch details');
        
        return await response.json();
    } catch (error) {
        console.error('Details fetch error:', error);
        return null;
    }
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

/**
 * Render the calendar grid for a month
 */
function renderCalendar(year, month, games) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    
    // Update header
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    
    let htmlContent = '';
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
        htmlContent += `<div class="date empty"></div>`;
    }
    
    // Render each day
    for (let day = 1; day <= daysInMonth; day++) {
        const gamesForDay = games.filter(game => {
            const releaseDate = new Date(game.released);
            return releaseDate.getDate() === day && 
                   releaseDate.getMonth() === month && 
                   releaseDate.getFullYear() === year;
        });
        
        const isToday = new Date().getDate() === day && 
                        new Date().getMonth() === month && 
                        new Date().getFullYear() === year;
        
        htmlContent += `
            <div class="date ${isToday ? 'today' : ''}">
                <span class="day-number">${day}</span>
                <div class="games-list">
                    ${gamesForDay.length > 0 
                        ? gamesForDay.map(game => `
                            <div class="game" data-id="${game.id}">
                                <div class="game-image-wrapper">
                                    <img src="${game.background_image}" 
                                         alt="${game.name}" 
                                         loading="lazy">
                                    <div class="game-overlay">
                                        <span class="game-name">${game.name}</span>
                                        ${game.rating ? `<span class="game-rating">★ ${game.rating}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')
                        : '<p class="no-games">No releases</p>'
                    }
                </div>
            </div>
        `;
    }
    
    calendarEl.innerHTML = htmlContent;
    
    // Add click handlers
    document.querySelectorAll('.game').forEach(gameEl => {
        gameEl.addEventListener('click', handleGameClick);
    });
}

/**
 * Handle game card click - show modal with details
 */
async function handleGameClick(event) {
    const gameEl = event.currentTarget;
    const gameId = gameEl.getAttribute('data-id');
    
    // Show modal with loading state
    showModalLoading();
    
    const gameDetails = await fetchGameDetails(gameId);
    
    if (gameDetails) {
        displayGameModal(gameDetails);
    } else {
        displayGameError();
    }
}

/**
 * Show modal loading state
 */
function showModalLoading() {
    document.getElementById('gameTitle').textContent = 'Loading...';
    document.getElementById('gameImage').src = '';
    document.getElementById('gameDescription').textContent = 'Fetching game details...';
    document.getElementById('gameReleaseDate').textContent = '...';
    document.getElementById('gameRating').textContent = '...';
    document.getElementById('gamePlatforms').textContent = '...';
    modal.style.display = 'block';
}

/**
 * Display game details in modal
 */
function displayGameModal(game) {
    document.getElementById('gameTitle').textContent = game.name;
    document.getElementById('gameImage').src = game.background_image || 'placeholder.jpg';
    document.getElementById('gameImage').alt = game.name;
    document.getElementById('gameDescription').textContent = stripHtmlTags(game.description);
    document.getElementById('gameReleaseDate').textContent = formatDate(game.released);
    document.getElementById('gameRating').textContent = game.rating ? `${game.rating}/5` : 'N/A';
    document.getElementById('gamePlatforms').textContent = game.platforms
        ? game.platforms.map(p => p.platform.name).join(', ')
        : 'Unknown';
    
    // Show genres if available
    const genresEl = document.getElementById('gameGenres');
    if (genresEl && game.genres) {
        genresEl.textContent = game.genres.map(g => g.name).join(', ');
    }
}

/**
 * Display error in modal
 */
function displayGameError() {
    document.getElementById('gameTitle').textContent = 'Error';
    document.getElementById('gameDescription').textContent = 'Could not load game details.';
}

// ============================================
// EVENT HANDLERS
// ============================================

function goToPrevMonth() {
    if (isLoading) return;
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    fetchGamesForMonth(currentYear, currentMonth);
}

function goToNextMonth() {
    if (isLoading) return;
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    fetchGamesForMonth(currentYear, currentMonth);
}

function closeModal() {
    modal.style.display = 'none';
}

// ============================================
// EVENT LISTENERS
// ============================================

prevBtn.addEventListener('click', goToPrevMonth);
nextBtn.addEventListener('click', goToNextMonth);

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (event) => {
    if (modal.style.display === 'block' && event.key === 'Escape') {
        closeModal();
    }
    if (!isLoading) {
        if (event.key === 'ArrowLeft') goToPrevMonth();
        if (event.key === 'ArrowRight') goToNextMonth();
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    fetchGamesForMonth(currentYear, currentMonth);
});