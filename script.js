const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';
let timeout = null;

document.addEventListener("DOMContentLoaded", () => {
    loadGenres();
    loadByFilter();
});

// Sidebar Toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

// Load Genres
async function loadGenres() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
        const data = await res.json();
        const genreList = document.getElementById("genre-list");

        data.genres.forEach(genre => {
            const li = document.createElement("li");
            li.textContent = genre.name;
            li.onclick = () => loadByFilter(genre.id);
            genreList.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading genres", err);
    }
}

// Fetch & Display Movies
async function fetchMovies(url) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No results found!";
            document.getElementById("movies").innerHTML = "";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching data!";
        document.getElementById("loading").style.display = "none";
    }
}

// Load By Filter
function loadByFilter(genre = "") {
    const sort = document.getElementById("sort").value;
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=${sort}`;
    if (genre) url += `&with_genres=${genre}`;
    fetchMovies(url);
}

// Debounced Search
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        } else {
            loadByFilter();
        }
    }, 300);
}
