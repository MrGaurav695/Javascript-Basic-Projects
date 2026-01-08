const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";

const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=" +
  API_KEY +
  "&page=1";

const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const SEARCH_API =
  "https://api.themoviedb.org/3/search/movie?api_key=" +
  API_KEY +
  "&query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

getMovies(API_URL);

async function getMovies(url) {
  const res = await fetch(url);
  const data = await res.json();

  showMovies(data.results);
}

function showMovies(movies) {
  main.innerHTML = "";

  if (!movies || movies.length === 0) {
    main.innerHTML = `
      <div class="no-results">
        <h2>No Results Found 😕</h2>
        <p>Try searching with another keyword.</p>
      </div>
    `;
    return;
  }

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview, id } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <img src="${poster_path ? IMG_PATH + poster_path : "https://via.placeholder.com/300x450"}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        ${overview}
      </div>
    `;

    movieEl.addEventListener("click", () => openMoviePopup(id));

    main.appendChild(movieEl);
  });
}

function getClassByRate(vote) {
  if (vote >= 8) return "green";
  if (vote >= 5) return "orange";
  return "red";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (searchTerm) {
    getMovies(SEARCH_API + searchTerm);
    search.value = "";
  }
});

async function openMoviePopup(id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits`
  );

  const movie = await res.json();

  document.getElementById("modal-img").src =
    IMG_PATH + movie.poster_path;

  document.getElementById("modal-title").innerText = movie.title;
  document.getElementById("modal-rating").innerText = movie.vote_average;
  document.getElementById("modal-overview").innerText = movie.overview;
  document.getElementById("modal-date").innerText = movie.release_date;

  const castNames = movie.credits.cast
    .slice(0, 5)
    .map((actor) => actor.name)
    .join(", ");

  document.getElementById("modal-cast").innerText = castNames;

  document.getElementById("modal").style.display = "flex";
}

document.getElementById("closeBtn").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

window.onclick = (e) => {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
};
