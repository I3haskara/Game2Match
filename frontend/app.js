// Backend API configuration
const API_BASE_URL = 'http://localhost:8000';

/**
 * Find games based on user preferences
 */
async function findGames() {
    const userInput = document.getElementById('userPreferences').value.trim();
    
    if (!userInput) {
        showError('Please enter your game preferences');
        return;
    }

    // Hide previous results and errors
    hideElement('resultsSection');
    hideElement('errorSection');
    
    // Show loading state
    showElement('loadingSection');

    try {
        const response = await fetch(`${API_BASE_URL}/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                preferences: userInput
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Hide loading
        hideElement('loadingSection');
        
        // Display results
        displayResults(data.recommendations);
        
    } catch (error) {
        hideElement('loadingSection');
        showError(`Failed to fetch recommendations: ${error.message}`);
        console.error('Error:', error);
    }
}

/**
 * Display game recommendations
 */
function displayResults(recommendations) {
    const resultsContainer = document.getElementById('gameResults');
    
    if (!recommendations || recommendations.length === 0) {
        resultsContainer.innerHTML = '<p>No games found matching your preferences. Try different criteria!</p>';
    } else {
        resultsContainer.innerHTML = recommendations.map(game => `
            <div class="game-card">
                <h3>${game.title || 'Untitled Game'}</h3>
                <div class="meta">
                    <strong>Genre:</strong> ${game.genre || 'N/A'} | 
                    <strong>Platform:</strong> ${game.platform || 'N/A'} | 
                    <strong>Rating:</strong> ${game.rating || 'N/A'}
                </div>
                <div class="description">
                    ${game.description || 'No description available'}
                </div>
                ${game.explanation ? `<div class="explanation"><em>${game.explanation}</em></div>` : ''}
            </div>
        `).join('');
    }
    
    showElement('resultsSection');
}

/**
 * Show error message
 */
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    showElement('errorSection');
}

/**
 * Helper functions to show/hide elements
 */
function showElement(elementId) {
    document.getElementById(elementId).classList.remove('hidden');
}

function hideElement(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

/**
 * Allow Enter key to submit (with Shift+Enter for new line)
 */
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('userPreferences');
    
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            findGames();
        }
    });
});
