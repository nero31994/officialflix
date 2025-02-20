const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';

let timeout = null;

// Fetch Movies
async function fetchMovies(url) {
    document.getElementById("loading").style.display = "block";
    try {
        const res = await fetch(url);
        const data = await res.json();
        document.getElementById("loading").style.display = "none";

        if (!data.results || data.results.length === 0) {
            document.getElementById("movies").innerHTML = "<p>No movies found!</p>";
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
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;
        
        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">${movie.title}</div>
        `;

        // Click Event for Episodes
        movieEl.onclick = () => fetchEpisodes(movie.id, movie.title);
        moviesDiv.appendChild(movieEl);
    });
}

// Fetch Episodes (TV Series)
async function fetchEpisodes(tvId, title) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/1?api_key=${API_KEY}`);
        const data = await res.json();

        if (!data.episodes || data.episodes.length === 0) {
            alert("No episodes available.");
            return;
        }

        const episodeList = data.episodes.map(ep => `<p>Episode ${ep.episode_number}: ${ep.name}</p>`).join("");
        document.getElementById("series-title").innerText = title;
        document.getElementById("episodes-list").innerHTML = episodeList;
        document.getElementById("episodes-popup").style.display = "block";
    } catch (err) {
        console.error("Error fetching episodes:", err);
    }
}

// Search Functionality
document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search").value;
    fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
});

// Load Movies on Start
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
