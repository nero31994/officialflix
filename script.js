const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Proxy route on Vercel

let timeout = null;
let selectedCategory = 'movie'; // Default category

async function fetchMovies(url) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            document.getElementById("movies").innerHTML = "";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return; // Skip if no poster
        
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name}</div>
        `;

        if (selectedCategory === 'tv') {
            movieEl.onclick = () => fetchEpisodes(movie.id);
        } else {
            movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        }

        moviesDiv.appendChild(movieEl);
    });
}

// Fetch Episodes for a TV Series
async function fetchEpisodes(tvId) {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/1?api_key=${API_KEY}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        const episodes = data.episodes || [];

        const moviesDiv = document.getElementById("movies");
        moviesDiv.innerHTML = ""; // Clear previous movies

        episodes.forEach(ep => {
            const epEl = document.createElement("div");
            epEl.classList.add("movie");
            epEl.innerHTML = `
                <img src="${IMG_URL}${ep.still_path || data.poster_path}" alt="${ep.name}" loading="lazy">
                <div class="overlay">${ep.episode_number}. ${ep.name}</div>
            `;
            epEl.onclick = () => window.open(`${PROXY_URL}${tvId}&season=1&episode=${ep.episode_number}`, "_blank");
            moviesDiv.appendChild(epEl);
        });

    } catch (err) {
        document.getElementById("error").innerText = "Error fetching episodes!";
    }
}

function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/${selectedCategory}?api_key=${API_KEY}&query=${query}`);
        } else {
            fetchMovies(`https://api.themoviedb.org/3/${selectedCategory}/popular?api_key=${API_KEY}`);
        }
    }, 300);
}

// Category Click Event
document.querySelectorAll(".categories a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        selectedCategory = e.target.dataset.category;
        fetchMovies(`https://api.themoviedb.org/3/${selectedCategory}/popular?api_key=${API_KEY}`);
    });
});

// Load popular movies on page load
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
