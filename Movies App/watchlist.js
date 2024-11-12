const apiKey = '351196dc77cd5fbc3a47e64e07254c5f';
const apiBase = 'https://api.themoviedb.org/3';
const imgBase = 'https://image.tmdb.org/t/p/w500';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

function displayWatchlist(movies) {
  const watchlistGrid = document.getElementById('watchlistGrid');
  watchlistGrid.innerHTML = movies
    .map(movie => `
      <div class="movie-card" onclick="openModal(${movie.id})">
        <img src="${imgBase}${movie.poster_path}" alt="${movie.title}">
        <div class="movie-card-content">
          <h3>${movie.title}</h3>
          <p>Release: ${movie.release_date}</p>
          <span class="favorite-icon" onclick="removeFromWatchlist(event, ${movie.id})">🗑️</span>
        </div>
      </div>
    `)
    .join('');
}

function removeFromWatchlist(event, movieId) {
  event.stopPropagation();
  watchlist = watchlist.filter(movie => movie.id !== movieId);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  displayWatchlist(watchlist);
}

function sortWatchlist() {
  const sortBy = document.getElementById('sort').value;
  const sortedMovies = [...watchlist].sort((a, b) => {
    if (sortBy === 'popularity.desc') return b.popularity - a.popularity;
    if (sortBy === 'release_date.desc') return new Date(b.release_date) - new Date(a.release_date);
    if (sortBy === 'vote_average.desc') return b.vote_average - a.vote_average;
  });

  displayWatchlist(sortedMovies);
}

async function openModal(movieId) {
  const response = await fetch(`${apiBase}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,videos`);
  const movie = await response.json();
  const cast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
  const trailer = movie.videos.results.find(video => video.type === 'Trailer');
  const trailerLink = trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Watch Trailer</a>` : '';

  const details = `
    <h2>${movie.title}</h2>
    <p><strong>Rating:</strong> ${movie.vote_average}</p>
    <p><strong>Runtime:</strong> ${movie.runtime} mins</p>
    <p><strong>Cast:</strong> ${cast}</p>
    <p>${movie.overview}</p>
    ${trailerLink}
  `;

  document.getElementById('movieDetails').innerHTML = details;
  document.getElementById('movieModal').style.display = 'flex';

  document.querySelector('.close-button').onclick = closeModal;
  window.onclick = (event) => {
    if (event.target == document.getElementById('movieModal')) {
      closeModal();
    }
  };
}

function closeModal() {
  document.getElementById('movieModal').style.display = 'none';
}

window.onload = () => {
  displayWatchlist(watchlist);
};
