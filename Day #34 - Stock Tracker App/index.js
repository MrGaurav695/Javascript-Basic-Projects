const symbolInput = document.querySelector('#symbol');
const stockList = document.querySelector('#stock-list');
const form = document.querySelector('form');

const API_KEY = "YOUR_API_KEY"; // put your real key here

// Utility: show message
function showMessage(message, type = "") {
    stockList.innerHTML = `<li class="${type}">${message}</li>`;
}

// Utility: loading UI
function showLoader() {
    stockList.innerHTML = `<li>Loading...</li>`;
}

// Fetch Top Stocks
async function fetchTopStocks() {
    try {
        showLoader();

        const res = await fetch(`https://www.alphavantage.co/query?function=SECTOR&apikey=${API_KEY}`);
        const data = await res.json();

        const stocks = data['Rank A: Real-Time Performance'];

        if (!stocks) {
            showMessage("API limit reached. Try later.", "error");
            return;
        }

        let html = '';

        Object.entries(stocks).slice(0, 10).forEach(([sector, change]) => {
            const color = parseFloat(change) >= 0 ? 'green' : 'red';

            html += `
                <li>
                    <span>${sector}</span>
                    <span style="color:${color}">${change}</span>
                </li>
            `;
        });

        stockList.innerHTML = html;

    } catch (err) {
        showMessage("Something went wrong!", "error");
    }
}

// Fetch Single Stock
async function fetchStockData(symbol) {
    try {
        if (!symbol) {
            fetchTopStocks();
            return;
        }

        showLoader();

        const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
        const data = await res.json();

        const quote = data['Global Quote'];

        if (!quote || !quote['10. change percent']) {
            showMessage("Invalid Symbol or API limit hit", "error");
            return;
        }

        const change = quote['10. change percent'].replace('%', '');
        const color = parseFloat(change) >= 0 ? 'green' : 'red';

        stockList.innerHTML = `
            <li>
                <span>${symbol}</span>
                <span style="color:${color}">${change}%</span>
            </li>
        `;

    } catch (err) {
        showMessage("Failed to fetch data", "error");
    }
}

// Debounce (prevents API spam)
let timeout;
function debounceFetch(symbol) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetchStockData(symbol);
    }, 500);
}

// Form submit
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const symbol = symbolInput.value.trim().toUpperCase();

    if (!symbol) {
        showMessage("Enter a stock symbol!", "error");
        return;
    }

    debounceFetch(symbol);
});

// Load default
fetchTopStocks();