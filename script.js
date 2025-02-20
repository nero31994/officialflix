const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id='; // Proxy route on Vercel
let currentCategory = 'movie';
let currentPage = 1;
let currentProvider = null;
let timeout = null;

async function fetchMovies(category = 'movie', page = 1, searchQuery = "", providerID = null) {
    document.getElementById("loading").style.display = "block";
    currentCategory = category;
    currentPage = page;
    currentProvider = providerID;

    let url = '';

    if (searchQuery) {
        url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}&page=${page}`;
    } else if (category === 'movie') {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;
    } else if (category === 'tv') {
        url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&page=${page}`;
    } else if (category === 'anime') {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=16&page=${page}`;
    }

    if (providerID) {
        url += `&with_watch_providers=${providerID}&watch_region=US`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results, page === 1);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

function displayMovies(movies, reset = false) {
    const moviesDiv = document.getElementById("movies");
    if (reset) moviesDiv.innerHTML = "";

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

function loadMoreMovies() {
    fetchMovies(currentCategory, ++currentPage, "", currentProvider);
}

function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetchMovies('movie', 1, document.getElementById("search").value);
    }, 300);
}

fetchMovies();
