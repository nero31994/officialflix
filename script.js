const API_KEY = '488eb36776275b8ae18600751059fb49';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://officialflix.vercel.app/api/proxy?id=';

let currentCategory = 'movie';
let currentPage = 1;

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const moviesDiv = document.getElementById("movies");
const loadMoreBtn = document.getElementById("load-more");

// Fetch movies based on category & page
async function fetchMovies(category = 'movie', page = 1) {
    loadingEl.style.display = "block";

    const categoryURLs = {
        movie: `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`,
        tv: `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`,
        anime: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&page=${page}`
    };

    const url = categoryURLs[category] || categoryURLs['movie'];

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch movies");
        
        const data = await res.json();
        loadingEl.style.display = "none";

        if (!data?.results?.length) {
            errorEl.innerText = "No movies found!";
            return;
        }

        errorEl.innerText = "";
        displayMovies(data.results, page === 1);
    } catch (err) {
        console.error(err);
        errorEl.innerText = "Error fetching movies!";
        loadingEl.style.display = "none";
    }
}

// Render movies
function displayMovies(movies, clear = false) {
    if (clear) moviesDiv.innerHTML = "";

    movies.forEach(({ id, poster_path, title }) => {
        if (!poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${poster_path}" alt="${title}" loading="lazy">
            <div class="overlay">${title}</div>
        `;
        movieEl.onclick = () => window.open(`${PROXY_URL}${id}`, "_blank");
        moviesDiv.appendChild(movieEl);
    });
}

// Load more movies
loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    fetchMovies(currentCategory, currentPage);
});

// Initial Load
fetchMovies(currentCategory);
