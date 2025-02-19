const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id='; // Proxy route on Vercel
let timeout = null;

// Categories
const categories = {
    popularMovies: `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`,
    trendingTV: `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`,
    anime: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&with_keywords=anime`
};

async function fetchMovies(url, category) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = `No ${category} found!`;
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results, category);
    } catch (err) {
        document.getElementById("error").innerText = `Error fetching ${category}!`;
        document.getElementById("loading").style.display = "none";
    }
}

function displayMovies(movies, category) {
    const moviesDiv = document.getElementById("movies");

    const categoryTitle = document.createElement("h2");
    categoryTitle.innerText = category;
    categoryTitle.classList.add("category-title");
    moviesDiv.appendChild(categoryTitle);

    const categoryGrid = document.createElement("div");
    categoryGrid.classList.add("grid");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name}</div>
        `;
        movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        categoryGrid.appendChild(movieEl);
    });

    moviesDiv.appendChild(categoryGrid);
}

function debounceSearch() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = document.getElementById("search").value;
        if (query.length > 2) {
            document.getElementById("movies").innerHTML = "";
            fetchMovies(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`, "Search Results");
        } else {
            loadCategories();
        }
    }, 300);
}

// Load all categories on page load
function loadCategories() {
    document.getElementById("movies").innerHTML = "";
    fetchMovies(categories.popularMovies, "Popular Movies");
    fetchMovies(categories.trendingTV, "Trending TV Series");
    fetchMovies(categories.anime, "Anime");
}

loadCategories();
