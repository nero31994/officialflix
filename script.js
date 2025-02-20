const API_KEY = '488eb36776275b8ae18600751059fb49';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

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

// Display Movies Only
function displayMovies(movies) {
    const moviesDiv = document.getElementById("movies");
    moviesDiv.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path || movie.media_type === "tv") return; // Ignore TV shows

        const movieEl = document.createElement("div");
        movieEl.classList.add("movie");
        movieEl.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy">
            <div class="overlay">${movie.title}</div>
        `;

        moviesDiv.appendChild(movieEl);
    });
}

// Search Movies
document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search").value;
    fetchMovies(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
});

// Load Movies on Start
fetchMovies(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
