// --- CONFIGURATION ---
// IMPORTANT: We will replace 'd1fa7l1r01qpc737jm7gd1fa7l1r01qpc737jm80' with our actual key during the CI/CD process.
const API_KEY = 'd1fa7l1r01qpc737jm7gd1fa7l1r01qpc737jm80'; 
const STOCKS_TO_TRACK = ['NVDA', 'INTC', 'QCOM', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD', 'NXPI'] 

// --- DOM ELEMENTS ---
const stockContainer = document.getElementById('stock-container');
const lastUpdatedElement = document.getElementById('last-updated');

// --- FUNCTIONS ---

/**
 * Fetches stock quote data from Finnhub API
 * @param {string} symbol The stock symbol (e.g., 'RELIANCE.NS')
 * @returns {Promise<object|null>} The stock data or null if an error occurs
 */
async function getStockQuote(symbol) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${symbol}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Creates and appends a stock card to the container
 * @param {string} symbol The stock symbol
 * @param {object} data The data from the API
 */
function displayStockData(symbol, data) {
    if (!data || data.c === 0) { // c is current price. If 0, data is likely unavailable.
        console.log(`No data available for ${symbol}`);
        return;
    }

    const card = document.createElement('div');
    card.className = 'stock-card';

    const change = data.d; // Change
    const percentChange = data.dp; // Percent change
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const sign = change >= 0 ? '+' : '';

    card.innerHTML = `
        <div class="stock-symbol">${symbol.replace('.NS', '')}</div>
        <div class="stock-price">\$${data.c.toFixed(2)}</div>
        <div class="stock-change ${changeClass}">
            ${sign}${change.toFixed(2)} (${sign}${percentChange.toFixed(2)}%)
        </div>
    `;

    stockContainer.appendChild(card);
}

/**
 * Main function to fetch and display all stocks
 */
async function updateStockPrices() {
    stockContainer.innerHTML = '<div class="loading">Fetching latest prices...</div>'; // Clear old data

    const stockPromises = STOCKS_TO_TRACK.map(symbol => getStockQuote(symbol));
    const stockDataArray = await Promise.all(stockPromises);

    stockContainer.innerHTML = ''; // Clear loading message

    STOCKS_TO_TRACK.forEach((symbol, index) => {
        const data = stockDataArray[index];
        displayStockData(symbol, data);
    });

    lastUpdatedElement.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
}


// --- INITIALIZATION ---

// Initial fetch when the page loads
updateStockPrices();

// Set an interval to refresh the data every 60 seconds (60000 milliseconds)
// The free Finnhub plan has a rate limit, so don't set this too low.
setInterval(updateStockPrices, 60000);