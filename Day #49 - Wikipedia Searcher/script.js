document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.search-box');
    const input = form.querySelector('input[type="search"]');
    const resultsContainer = document.querySelector('.results');
    const resultsCounter = document.querySelector('header p');
    const searchBtn = form.querySelector('button');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchTerm = input.value.trim();
        if (searchTerm) {
            searchWikipedia(searchTerm);
        }
    });

    function searchWikipedia(searchTerm) {
        // Show loading state
        searchBtn.textContent = 'Searching...';
        searchBtn.disabled = true;
        resultsContainer.innerHTML = '<div class="no-results">Searching Wikipedia...</div>';
        
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=500&srsearch=${encodeURIComponent(searchTerm)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Reset button state
                searchBtn.textContent = 'Search';
                searchBtn.disabled = false;
                displayResults(data.query.search);
            })
            .catch(error => {
                searchBtn.textContent = 'Search';
                searchBtn.disabled = false;
                resultsContainer.innerHTML = `<div class="no-results">Error: ${error.message}</div>`;
            });
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">No results found. Try a different search term.</div>';
            resultsCounter.textContent = 'Results Count : 0';
            return;
        }
        
        resultsCounter.textContent = `Results Count : ${results.length}`;
        
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result';
            
            // Clean up snippet HTML
            const snippet = result.snippet.replace(/<[^>]*>/g, '');
            
            resultElement.innerHTML = `
                <h3>${result.title}</h3>
                <p>${snippet}...</p>
                <a href="https://en.wikipedia.org/?curid=${result.pageid}" target="_blank">Read More</a>
            `;
            resultsContainer.appendChild(resultElement);
        });
    }
});