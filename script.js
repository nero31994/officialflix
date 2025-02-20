const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = '/api/proxy?id=';
let timeout = null;
let page = 1;

// Load All Movies, TV Shows, and Anime
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

        displayContent([...movies.results, ...tvShows.results, ...anime.results]);
    } catch (err) {
        document.getElementById("error").innerText = "Error fetching content!";
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
                showEpisodePopup(item.id, item.name);
            } else {
                openMovie(item.id);
            }
        };
        moviesDiv.appendChild(contentEl);
    });
}

// Show Episodes in Popup
async function showEpisodePopup(tvId, title) {
    const popup = document.getElementById("episodePopup");
    const episodeList = document.getElementById("episodeList");
    const popupTitle = document.getElementById("popupTitle");

    popup.style.display = "block";
    popupTitle.innerText = `Episodes - ${title}`;
    episodeList.innerHTML = "<p>Loading episodes...</p>";

    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`);
        const data = await res.json();
        
        episodeList.innerHTML = "";

        for (const season of data.seasons) {
            await fetchSeasonEpisodes(tvId, season.season_number, episodeList);
        }
    } catch {
        episodeList.innerHTML = "<p>Error loading episodes.</p>";
    }
}

async function fetchSeasonEpisodes(tvId, seasonNumber, episodeList) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
        const seasonData = await res.json();

        seasonData.episodes.forEach(ep => {
            const epDiv = document.createElement("div");
            epDiv.classList.add("episode");
            epDiv.innerText = `E${ep.episode_number}: ${ep.name}`;
            epDiv.onclick = () => openMovie(tvId, seasonNumber, ep.episode_number);
            episodeList.appendChild(epDiv);
        });
    } catch {
        console.error(`Error fetching episodes`);
    }
}

function openMovie(id, season = null, episode = null) {
    let url = `${PROXY_URL}${id}`;
    if (season && episode) url += `&season=${season}&episode=${episode}`;
    window.open(url, "_blank");
}

function closePopup() {
    document.getElementById("episodePopup").style.display = "none";
}

// Infinite Scroll
window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        page++;
        fetchAllContent();
    }
});

// Initial Load
fetchAllContent();
