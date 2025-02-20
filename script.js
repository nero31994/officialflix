const API_KEY = '488eb36776275b8ae18600751059fb49'; // Replace with your TMDB API key
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id='; // Proxy route on Vercel
let page = 1;
let category = 'movie';
let loading = false;

// Fetch Movies, TV Shows, or Anime
async function fetchMovies(type = 'movie', reset = false) {
    if (loading) return;
    loading = true;

    if (reset) {
        document.getElementById("movies").innerHTML = '';
        page = 1;
    }

    document.getElementById("loading").style.display = "block";
    category = type;

    try {
        let url;
        if (type === 'anime') {
            url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&page=${page}`; // Anime Genre (16)
        } else if (type === 'tv') {
            url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`;
        } else {
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&page=${page}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("error").innerText = "No results found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayMovies(data.results, type);
        page++;
        loading = false;
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching data!";
        document.getElementById("loading").style.display = "none";
        loading = false;
    }
}

// Display Movies or TV Shows
function displayMovies(movies, type) {
    const moviesDiv = document.getElementById("movies");

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}" loading="lazy">
            <div class="overlay">${movie.title || movie.name}</div>
        `;
        
        if (type === 'tv' || type === 'anime') {
            movieEl.onclick = () => fetchEpisodes(movie.id);
        } else {
            movieEl.onclick = () => window.open(`${PROXY_URL}${movie.id}`, "_blank");
        }

        moviesDiv.appendChild(movieEl);
    });
}

// Fetch Episodes for TV Shows
async function fetchEpisodes(tvId) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`);
        const data = await res.json();

        if (!data.seasons || data.seasons.length === 0) {
            document.getElementById("error").innerText = "No seasons found!";
            return;
        }

        displaySeasons(tvId, data.seasons);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching seasons!";
    }
}

// Display TV Show Seasons
function displaySeasons(tvId, seasons) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = ''; // Clear and show seasons

    seasons.forEach(season => {
        if (!season.poster_path) return;

        const seasonEl = document.createElement("div");
        seasonEl.classList.add("movie");
        seasonEl.innerHTML = `
            <img src="${IMG_URL}${season.poster_path}" alt="${season.name}" loading="lazy">
            <div class="overlay">${season.name}</div>
        `;
        
        seasonEl.onclick = () => fetchSeasonEpisodes(tvId, season.season_number);
        moviesDiv.appendChild(seasonEl);
    });
}

// Fetch and Display Season Episodes
async function fetchSeasonEpisodes(tvId, seasonNumber) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        const data = await res.json();

        if (!data.episodes || data.episodes.length === 0) {
            document.getElementById("error").innerText = "No episodes found!";
            return;
        }

        const moviesDiv = document.getElementById("movies");
        moviesDiv.innerHTML = ''; // Clear and show episodes

        data.episodes.forEach(episode => {
            if (!episode.still_path) return;

            const episodeEl = document.createElement("div");
            episodeEl.classList.add("movie");
            episodeEl.innerHTML = `
                <img src="${IMG_URL}${episode.still_path}" alt="${episode.name}" loading="lazy">
                <div class="overlay">${episode.name}</div>
            `;
            
            episodeEl.onclick = () => window.open(`${PROXY_URL}${tvId}-s${seasonNumber}e${episode.episode_number}`, "_blank");
            moviesDiv.appendChild(episodeEl);
        });
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching season!";
    }
}

// Handle Category Clicks
document.querySelectorAll(".categories a").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const newCategory = e.target.getAttribute("data-category");
        fetchMovies(newCategory, true);
    });
});

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        fetchMovies(category);
    }
});

// Load Movies on Start
fetchMovies('movie');
