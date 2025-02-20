const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id='; // Proxy route on Vercel
let page = 1;

// Load movies on scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMovies();
    }
});

// Fetch movies
async function loadMovies() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`);
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

// Show episode popup
function showEpisodePopup(tvId, title) {
    const popup = document.getElementById("episodePopup");
    const episodeList = document.getElementById("episodeList");
    const popupTitle = document.getElementById("popupTitle");

    popup.style.display = "flex";
    popupTitle.innerText = `Episodes - ${title}`;
    episodeList.innerHTML = "<p>Loading episodes...</p>";

    fetch(`https://api.themoviedb.org/3/tv/${tvId}/seasons?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            episodeList.innerHTML = "";
            data.seasons.forEach(season => {
                fetchSeasonEpisodes(tvId, season.season_number, episodeList);
            });
        })
        .catch(() => {
            episodeList.innerHTML = "<p>Error loading episodes.</p>";
        });
}

// Fetch episodes per season
function fetchSeasonEpisodes(tvId, seasonNumber, episodeList) {
    fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            data.episodes.forEach(episode => {
                const episodeItem = document.createElement("div");
                episodeItem.classList.add("episode");
                episodeItem.innerText = `S${seasonNumber}E${episode.episode_number} - ${episode.name}`;
                episodeItem.onclick = () => window.open(`${PROXY_URL}${episode.id}`, "_blank");
                episodeList.appendChild(episodeItem);
            });
        });
}

// Close popup
function closePopup() {
    document.getElementById("episodePopup").style.display = "none";
}

// Load movies on page load
loadMovies();
