const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let page = 1;
let currentCategory = 'movie/popular';

// Fetch Movies
async function fetchMoviesByCategory(category) {
    currentCategory = category;
    page = 1;
    document.getElementById("movies").innerHTML = "";
    let url = category === 'anime' 
        ? `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&page=${page}`
        : `https://api.themoviedb.org/3/${category}?api_key=${API_KEY}&page=${page}`;
    fetchMovies(url);
}

// Fetch Movies from API
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

// Display Movies or TV Shows
function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");

        let movieTitle = movie.title || movie.name;
        let isTV = (currentCategory === 'tv/popular' || currentCategory === 'anime');

        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movieTitle}" loading="lazy">
            <div class="overlay">${movieTitle}</div>
        `;

        movieEl.onclick = () => {
            if (isTV) {
                fetchEpisodes(movie.id, movieTitle);
            } else {
                window.open(`${PROXY_URL}${movie.id}`, "_blank");
            }
        };

        moviesDiv.appendChild(movieEl);
    });
}

// Fetch TV Show Episodes
async function fetchEpisodes(tvId, showTitle) {
    const url = `https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (!data.seasons || data.seasons.length === 0) {
            alert("No episodes found!");
            return;
        }
        showEpisodesModal(data, showTitle);
    } catch (err) {
        alert("Error loading episodes.");
    }
}

// Display Episodes in Modal
function showEpisodesModal(tvData, showTitle) {
    const modal = document.getElementById("episodes-modal");
    const modalContent = document.getElementById("episodes-list");
    
    modalContent.innerHTML = `<h2>${showTitle} - Episodes</h2>`;

    tvData.seasons.forEach(season => {
        if (season.season_number === 0) return;

        const seasonEl = document.createElement("div");
        seasonEl.classList.add("season");
        seasonEl.innerHTML = `<h3>Season ${season.season_number}</h3>`;

        seasonEl.onclick = async () => {
            const episodes = await fetchSeasonEpisodes(tvData.id, season.season_number);
            displayEpisodeList(episodes, tvData.id);
        };

        modalContent.appendChild(seasonEl);
    });

    modal.style.display = "block";
}

// Fetch Episodes from API
async function fetchSeasonEpisodes(tvId, seasonNumber) {
    const url = `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.episodes || [];
    } catch (err) {
        alert("Error loading season episodes.");
        return [];
    }
}

// Close Modal
document.getElementById("close-modal").onclick = () => {
    document.getElementById("episodes-modal").style.display = "none";
};

// Infinite Scroll
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        page++;
        let url = currentCategory === 'anime'
            ? `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&page=${page}`
            : `https://api.themoviedb.org/3/${currentCategory}?api_key=${API_KEY}&page=${page}`;
        fetchMovies(url);
    }
});

// Search Function
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
