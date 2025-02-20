const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let timeout = null;
let page = 1;

async function fetchAllContent() {
    document.getElementById("loading").style.display = "block";
    
    try {
        const [moviesRes, tvRes, animeRes] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&page=${page}`),
            fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&page=${page}`)
        ]);

        const [movies, tvShows, anime] = await Promise.all([
            moviesRes.json(),
            tvRes.json(),
            animeRes.json()
        ]);

        document.getElementById("loading").style.display = "none";

        if (!movies.results.length && !tvShows.results.length && !anime.results.length) {
            document.getElementById("error").innerText = "No content found!";
            return;
        }

        document.getElementById("error").innerText = "";
        displayContent([...movies.results, ...tvShows.results, ...anime.results]);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching content!";
        document.getElementById("loading").style.display = "none";
    }
}

function displayContent(contentList) {
    const moviesDiv = document.getElementById("movies");

    contentList.forEach(item => {
        if (!item.poster_path) return;

        const contentEl = document.createElement("div");
        contentEl.classList.add("movie");
        contentEl.innerHTML = `
            <img src="${IMG_URL}${item.poster_path}" alt="${item.title || item.name}">
            <div class="overlay">${item.title || item.name}</div>
        `;
        contentEl.onclick = () => {
            if (item.media_type === "tv" || item.name) {
                fetchEpisodes(item.id);
            } else {
                openMovie(item.id);
            }
        };
        moviesDiv.appendChild(contentEl);
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

function openMovie(id, season = null, episode = null) {
    let url = `${PROXY_URL}${id}`;
    if (season && episode) url += `&season=${season}&episode=${episode}`;
    window.open(url, "_blank");
}

// Infinite Scroll
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        page++;
        fetchAllContent();
    }
});

// Load all content on page load
fetchAllContent();
