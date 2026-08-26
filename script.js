// TAB SWITCHING
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});


// ================================
// STORAGE
// ================================

// Load saved films from localStorage
let films = JSON.parse(localStorage.getItem('filmoFilms')) || [];


// Save films to localStorage
function saveFilms() {
  localStorage.setItem('filmoFilms', JSON.stringify(films));
}


// ================================
// LIVE PREVIEW
// ================================

filmName.oninput = e =>
  pFilm.innerText = e.target.value || 'Film Name';

watchCount.oninput = e =>
  pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;

emoji.oninput = e =>
  pEmoji.innerText = e.target.value;

favoriteLine.oninput = e =>
  pLine.innerText = e.target.value || 'a line that stayed with you…';

lineFont.oninput = e =>
  pLine.className = `line ${e.target.value}`;

ost.oninput = e =>
  pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;

remind.oninput = e =>
  pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;


// ================================
// CREATE FILM CARD
// ================================

function createFilmCard(film) {

  const card = document.createElement('div');
  card.className = 'film-card';

  card.innerHTML = `
    <h3 class="film-title">${film.title}</h3>

    <div class="meta">
      <span>🎬 ${film.watchCount}</span>
      <span>${film.emoji}</span>
    </div>

    <p class="line ${film.font}">
      ${film.quote || ''}
    </p>

    <ul class="details">
      <li>
        <strong>Favorite OST:</strong> ${film.ost || '—'}
      </li>

      <li>
        <strong>Reminds me of:</strong> ${film.remindsMeOf || '—'}
      </li>
    </ul>
  `;

  cardGrid.prepend(card);
}


// ================================
// LOAD SAVED FILMS
// ================================

films.forEach(film => {
  createFilmCard(film);
});


// ================================
// ADD CARD TO EXPLORE
// ================================

addCard.onclick = () => {

  // Don't add a film without a title
  if (!filmName.value) return;


  // Create a film object
  const film = {
    title: filmName.value,
    watchCount: watchCount.value || 0,
    emoji: emoji.value,
    quote: favoriteLine.value || '',
    font: lineFont.value,
    ost: ost.value || '',
    remindsMeOf: remind.value || '',
    dateAdded: new Date().toISOString()
  };


  // Add the film to our films array
  films.push(film);


  // Save the updated array to localStorage
  saveFilms();


  // Create and display the card
  createFilmCard(film);
};
