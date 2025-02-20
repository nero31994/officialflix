const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';
let page = 1;
let currentCategory = 'movie/popular';

// Fetch Movies by Category
async function fetchMoviesByCategory(category) {
    currentCategory = category;
    page = 1;
    document.getElementById("movies").innerHTML = "";
    fetchMovies(`https://api.themoviedb.org/3/${category}?api_key=${API_KEY}&page=${page}`);
}

// Fetch Movies
async function fetchMovies(url) {
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
        displayMovies(data.results);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching movies!";
        document.getElementById("loading").style.display = "none";
    }
}

// Display Movies
function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        let movieTitle = movie.title || movie.name;
        let detailsLink = `${PROXY_URL}${movie.id}`;

        if (currentCategory.includes('tv')) {
            movieTitle += " (TV Series)";
            detailsLink += "&type=tv";
        }

        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movieTitle}" loading="lazy">
            <div class="overlay">${movieTitle}</div>
        `;
        movieEl.onclick = () => window.open(detailsLink, "_blank");
        moviesDiv.appendChild(movieEl);
    });
}

// Infinite Scroll
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreMovies();
    }
});

// Load More Movies on Scroll
function loadMoreMovies() {
    page++;
    fetchMovies(`https://api.themoviedb.org/3/${currentCategory}?api_key=${API_KEY}&page=${page}`);
}

// Search Movies
document.getElementById("search").addEventListener("input", function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = this.value;
        if (query.length > 2) {
            fetchMovies(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`);
        } else {
            fetchMoviesByCategory(currentCategory);
        }
    }, 300);
});

// Load Popular Movies on Page Load
fetchMoviesByCategory(currentCategory);
