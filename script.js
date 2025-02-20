const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id='; 
let page = 1;
let query = "";

// Fetch movies
async function loadMovies() {
    try {
        let url = query
            ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`
            : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;

        const res = await fetch(url);
        const data = await res.json();
        displayMovies(data.results);
        page++;
    } catch (error) {
        console.error("Error loading movies:", error);
    }
}

// Display movies
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

        movieEl.onclick = () => {
            if (movie.media_type === "tv") {
                showEpisodePopup(movie.id, movie.name || movie.title);
            } else {
                window.open(`${PROXY_URL}${movie.id}`, "_blank");
            }
        };

        moviesDiv.appendChild(movieEl);
    });
}

// Load episodes for TV shows
async function showEpisodePopup(tvId, seriesTitle) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/1?api_key=${API_KEY}`);
        const data = await res.json();
        
        const episodesDiv = document.getElementById("episodes");
        episodesDiv.innerHTML = "";
        document.getElementById("series-title").innerText = seriesTitle;

        data.episodes.forEach(episode => {
            const epEl = document.createElement("div");
            epEl.classList.add("episode");
            epEl.innerHTML = `<p>${episode.episode_number}: ${episode.name}</p>`;
            epEl.onclick = () => window.open(`${PROXY_URL}${tvId}-s01e${episode.episode_number}`, "_blank");
            episodesDiv.appendChild(epEl);
        });

        document.getElementById("episode-popup").style.display = "block";
    } catch (error) {
        console.error("Error loading episodes:", error);
    }
}

// Close Popup
document.getElementById("close-popup").addEventListener("click", () => {
    document.getElementById("episode-popup").style.display = "none";
});

// Search
document.getElementById("search-btn").addEventListener("click", () => {
    query = document.getElementById("search").value.trim();
    if (query.length > 2) {
        document.getElementById("movies").innerHTML = "";
        page = 1;
        loadMovies();
    }
});

// Load movies on page load
loadMovies();

// Infinite Scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMovies();
    }
});
