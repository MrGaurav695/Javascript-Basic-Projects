const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

let page = 1;
let query = "";
let loading = false;

// Fetch Movies
async function getMovies(url) {
    try {
        loading = true;
        loader.style.display = "block";

        const res = await fetch(url);
        const data = await res.json();

        loader.style.display = "none";
        loading = false;

        return data.results;
    } catch (err) {
        loader.innerText = "Error loading data";
        return [];
    }
}

// Show Movies
function showMovies(movies) {
    movies.forEach(movie => {
        const { title, poster_path, vote_average, overview } = movie;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        movieEl.innerHTML = `
            <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/300'}">
            
            <div class="movie-info">
                <h3>${title}</h3>
                <span class="${getColor(vote_average)}">${vote_average}</span>
            </div>

            <div class="overview">
                ${overview || "No description available"}
            </div>
        `;

        result.appendChild(movieEl);
    });
}

// Rating color
function getColor(vote) {
    if (vote >= 8) return "green";
    if (vote >= 5) return "orange";
    return "red";
}

// Search
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    query = input.value.trim();
    if (!query) return;

    page = 1;
    result.innerHTML = "";

    const movies = await getMovies(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
    );

    showMovies(movies);
});

// Infinite scroll
window.addEventListener("scroll", async () => {
    if (loading) return;

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page++;

        const url = query
            ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
            : `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}`;

        const movies = await getMovies(url);
        showMovies(movies);
    }
});

// Initial load
(async function init() {
    const movies = await getMovies(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}`
    );

    showMovies(movies);
})();