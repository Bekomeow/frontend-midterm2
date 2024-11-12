const apiKey = '351196dc77cd5fbc3a47e64e07254c5f';
const apiBase = 'https://api.themoviedb.org/3';
const imgBase = 'https://image.tmdb.org/t/p/w500';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let searchResults = [];

document.getElementById('searchButton').addEventListener('click', () => {
  const query = document.getElementById('search').value;
  console.log(query);
  if (query) searchMovies(query);
});

async function searchMovies(query) {
  const response = await fetch(`${apiBase}/search/movie?api_key=${apiKey}&query=${query}`);
  const data = await response.json();
  searchResults = data.results;
  displayMovies(data.results);
}


// async function searchMovies(event) {
//   const query = event;
//   const autocompleteResults = document.getElementById('autocomplete_results');

//   autocompleteResults.innerHTML = '';

//   if (!query) return;

//   try {
//     const response = await fetch(`${apiBase}/search/movie?api_key=${apiKey}&query=${query}`);
//     console.log(response);
//     const data = await response.json();
//     const results = data.results;

//     if (results.length > 0) {
//       results.forEach(movie => {
//         const div = document.createElement('div');
//         div.classList.add('autocomplete-item');
//         div.innerHTML = `
//           <img src="${imgBase}${movie.poster_path}" alt="${movie.title}" style="width: 30px; height: 45px; margin-right: 10px;">
//           <span>${movie.title}</span>
//         `;
//         div.onclick = () => selectMovie(movie);
//         autocompleteResults.appendChild(div);
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching movies:', error);
//   }
// }

// function selectMovie(movie) {
//   document.getElementById('search').value = movie.title;
//   document.getElementById('autocomplete_results').innerHTML = '';
//   console.log('Selected movie:', movie);
// }


function displayMovies(movies) {
  const movieGrid = document.getElementById('movieGrid');
  movieGrid.innerHTML = movies
    .map(movie => {
      const isFavorite = watchlist.some(item => item.id === movie.id);
      return `
        <div class="movie-card" onclick="openModal(${movie.id})">
          <img src="${imgBase}${movie.poster_path}" alt="${movie.title}">
          <div class="movie-card-content">
            <h3>${movie.title}</h3>
            <p>Release: ${movie.release_date}</p>
            <span class="favorite-icon" onclick="toggleWatchlist(event, ${JSON.stringify(movie).replace(/"/g, '&quot;')})">
              ${isFavorite ? '🗑️' : '⭐'}
            </span>
          </div>
        </div>
      `;
    })
    .join('');
}

function toggleWatchlist(event, movie) {
  event.stopPropagation();
  const index = watchlist.findIndex(item => item.id === movie.id);

  if (index === -1) {
    watchlist.push(movie);
  } else {
    watchlist.splice(index, 1);
  }

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  displayMovies(searchResults);
}

function sortMovies() {
  const sortBy = document.getElementById('sort').value;
  const sortedMovies = [...searchResults].sort((a, b) => {
    if (sortBy === 'popularity.desc') return b.popularity - a.popularity;
    if (sortBy === 'release_date.desc') return new Date(b.release_date) - new Date(a.release_date);
    if (sortBy === 'vote_average.desc') return b.vote_average - a.vote_average;
  });

  displayMovies(sortedMovies);
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
}

document.querySelector('.close-button').onclick = () => {
  document.getElementById('movieModal').style.display = 'none';
};
