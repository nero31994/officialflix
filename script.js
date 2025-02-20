const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
let page = 1;

// Fetch Movies
async function fetchMovies(url) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            return;
        }

        displayMovies(data.results);
    } catch (err) {
        document.getElementById("loading").style.display = "none";
        console.error("Error fetching movies:", err);
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
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">${movie.title}</div>
        `;

        moviesDiv.appendChild(movieEl);
    });
}

// Infinite Scroll
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page++;
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
    }
});

// Search Movies
document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search").value;
    document.getElementById("movies").innerHTML = "";
    fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
});

// Load Movies on Start
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
