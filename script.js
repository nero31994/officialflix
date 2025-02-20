const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let timeout = null;
let page = 1;
let category = 'popular';

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

function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title || movie.name}">
            <div class="overlay">${movie.title || movie.name}</div>
        `;
        movieEl.onclick = () => {
            if (category === "tv") {
                fetchEpisodes(movie.id);
            } else {
                openMovie(movie.id);
            }
        };
        moviesDiv.appendChild(movieEl);
    });
}

async function fetchEpisodes(tvId) {
    document.getElementById("episodes").innerHTML = "<p>Loading episodes...</p>";

    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`);
        const data = await res.json();

        if (!data.seasons || data.seasons.length === 0) {
            document.getElementById("episodes").innerText = "No episodes available.";
            return;
        }

        document.getElementById("episodes").innerHTML = "<h3>Episodes:</h3>";

        for (const season of data.seasons) {
            if (season.season_number === 0) continue; // Skip specials
            await fetchSeasonEpisodes(tvId, season.season_number);
        }
    } catch (err) {
        document.getElementById("episodes").innerText = "Error loading episodes.";
    }
}

async function fetchSeasonEpisodes(tvId, seasonNumber) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        const seasonData = await res.json();

        const seasonTitle = document.createElement("h4");
        seasonTitle.innerText = `Season ${seasonNumber}`;
        document.getElementById("episodes").appendChild(seasonTitle);

        seasonData.episodes.forEach(ep => {
            const epDiv = document.createElement("div");
            epDiv.classList.add("episode");
            epDiv.innerText = `E${ep.episode_number}: ${ep.name}`;
            epDiv.onclick = () => openMovie(tvId, seasonNumber, ep.episode_number);
            document.getElementById("episodes").appendChild(epDiv);
        });
    } catch (err) {
        console.error(`Error fetching Season ${seasonNumber} episodes:`, err);
    }
}

function fetchCategory(type) {
    category = type;
    page = 1;
    document.getElementById("movies").innerHTML = "";
    document.getElementById("episodes").innerHTML = "";

    if (type === 'anime') {
        fetchMovies(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`);
    } else if (type === 'tv') {
        fetchMovies(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`);
    } else {
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
    }
}

function openMovie(id, season = null, episode = null) {
    let url = `${PROXY_URL}${id}`;
    if (season && episode) url += `&season=${season}&episode=${episode}`;
    window.open(url, "_blank");
}

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        page++;
        let url = `https://api.themoviedb.org/3/${category === 'tv' ? 'tv' : 'movie'}/popular?api_key=${API_KEY}&page=${page}`;
        fetchMovies(url);
    }
});

fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
