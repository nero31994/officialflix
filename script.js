const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Your proxy URL
let timeout = null;

document.getElementById("search").addEventListener("input", debounceSearch);

function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        } else {
            fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
        }
    }, 300);
}

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

// Load popular movies on page load
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
