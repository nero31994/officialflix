const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BASE_URL = 'https://api.themoviedb.org/3';
const PROXY_URL = '/api/proxy?id='; // Proxy route on Vercel

let currentPage = 1;
let isLoading = false;

// Fetch and display movies
async function fetchMovies(page = 1) {
    if (isLoading) return;
    isLoading = true;

    document.getElementById("loading").style.display = "block";
    try {
        const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results.length > 0) {
            displayMovies(data.results);
        } else {
            document.getElementById("error").innerText = "No movies found!";
        }
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
    } finally {
        document.getElementById("loading").style.display = "none";
        isLoading = false;
    }
}

// Display movie cards
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
        moviesDiv.appendChild(movieEl);
    });
}

// Infinite Scroll to Load More Movies
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        fetchMovies(++currentPage);
    }
});

// Search Functionality
document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search").value.trim();
    if (query.length > 2) {
        searchMovies(query);
    }
});

async function searchMovies(query) {
    document.getElementById("movies").innerHTML = "";
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await res.json();
        
        if (data.results.length > 0) {
            displayMovies(data.results);
        } else {
            document.getElementById("error").innerText = "No movies found!";
        }
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}

// Load initial movies
fetchMovies();
