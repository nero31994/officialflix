const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let currentCategory = 'movie';
let currentPage = 1;
let isFetching = false;
let timeout = null;

async function fetchMovies(category, page = 1) {
    if (isFetching) return;
    isFetching = true;
    document.getElementById("loading").style.display = "block";
    let url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    } finally {
        isFetching = false;
    }
}

function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">${movie.title}</div>
        `;
        movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        moviesDiv.appendChild(movieEl);
    });
}

function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        fetchMovies(query ? `search/${query}` : currentCategory);
    }, 300);
}

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        currentPage++;
        fetchMovies(currentCategory, currentPage);
    }
});

// Load initial movies
fetchMovies(currentCategory);
