const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Proxy route on Vercel
let timeout = null;

// Function to fetch movies from an API URL
async function fetchMovies(url, containerId) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results, containerId);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

// Function to display movies in the given container
function displayMovies(movies, containerId) {
    const moviesDiv = document.getElementById(containerId);
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return; // Skip movies without posters
            
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

// Search function with debounce
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`, "popular");
        } else {
            loadCategories();
        }
    }, 300);
}

// Function to load all categories
function loadCategories() {
    fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`, "popular");
    fetchMovies(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`, "trending");
    fetchMovies(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`, "tvseries");
    fetchMovies(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`, "anime"); // Genre 16 = Anime
}

// Load all categories on page load
loadCategories();
