const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Proxy route on Vercel
let page = 1;
let category = 'movie';
let loading = false;

// Fetch Movies
async function fetchMovies(type, reset = false) {
    if (loading) return;
    loading = true;

    if (reset) {
        document.getElementById("movies").innerHTML = '';
        page = 1;
    }

    document.getElementById("loading").style.display = "block";
    category = type;

    try {
        const res = await fetch(`https://api.themoviedb.org/3/${type === 'anime' ? 'discover/tv' : 'discover/' + type}?api_key=${API_KEY}&page=${page}`);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No movies found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results);
        page++;
        loading = false;
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
        loading = false;
    }
}

// Display Movies
function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name}</div>
        `;
        movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        moviesDiv.appendChild(movieEl);
    });
}

// Search Function
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`search/movie?api_key=${API_KEY}&query=${query}`, true);
        } else {
            fetchMovies(category, true);
        }
    }, 300);
}

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        fetchMovies(category);
    }
});

// Load Movies on Start
fetchMovies('movie');
