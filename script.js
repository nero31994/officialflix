const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let timeout = null;
let currentPage = 1;
let currentCategory = 'movie';

// Fetch Movies
async function fetchMovies(url, append = false) {
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
        displayMovies(data.results, append);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

// Display Movies
function displayMovies(movies, append = false) {
    const moviesDiv = document.getElementById("movies");
    if (!append) moviesDiv.innerHTML = "";

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

    document.getElementById("loadMore").style.display = "block";
}

// Search Function
function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        } else {
            loadCategory(currentCategory);
        }
    }, 300);
}

// Load Movies by Category
function loadCategory(category) {
    currentCategory = category;
    currentPage = 1;
    fetchMovies(`https://api.themoviedb.org/3/${category}/popular?api_key=${API_KEY}`);
}

// Load More Function
document.getElementById("loadMore").addEventListener("click", () => {
    currentPage++;
    fetchMovies(`https://api.themoviedb.org/3/${currentCategory}/popular?api_key=${API_KEY}&page=${currentPage}`, true);
});

// Load Default Movies
loadCategory('movie');
