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
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}">
            <div class="overlay">${movie.title}</div>
        `;
        movieEl.onclick = () => movie.type === "tv" ? fetchEpisodes(movie.id) : openMovie(movie.id);
        moviesDiv.appendChild(movieEl);
    });
}

function fetchEpisodes(tvId) {
    document.getElementById("episodes").innerHTML = "<p>Loading episodes...</p>";

    fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/1?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("episodes").innerHTML = "";
            data.episodes.forEach(ep => {
                const epDiv = document.createElement("div");
                epDiv.classList.add("episode");
                epDiv.innerText = `Episode ${ep.episode_number}: ${ep.name}`;
                epDiv.onclick = () => openMovie(tvId, ep.episode_number);
                document.getElementById("episodes").appendChild(epDiv);
            });
        })
        .catch(() => document.getElementById("episodes").innerText = "Error loading episodes.");
}

function fetchCategory(type) {
    category = type;
    page = 1;
    document.getElementById("movies").innerHTML = "";
    if (type === 'anime') {
        fetchMovies(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`);
    } else if (type === 'tv') {
        fetchMovies(`https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`);
    } else {
        fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
    }
}

function openMovie(id, episode = null) {
    let url = `${PROXY_URL}${id}`;
    if (episode) url += `&episode=${episode}`;
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
