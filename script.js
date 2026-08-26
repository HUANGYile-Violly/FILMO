// ========================================
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = '把你的 publishable key 放这里';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// TAB SWITCHING
// ========================================

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {

    document.querySelectorAll('.tab')
      .forEach(t => t.classList.remove('active'));

    document.querySelectorAll('.tab-content')
      .forEach(c => c.classList.remove('active'));

    tab.classList.add('active');

    document
      .getElementById(tab.dataset.tab)
      .classList.add('active');
  });
});


// ========================================
// LIVE PREVIEW
// ========================================

filmName.oninput = e =>
  pFilm.innerText = e.target.value || 'Film Name';

watchCount.oninput = e =>
  pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;

emoji.oninput = e =>
  pEmoji.innerText = e.target.value;

favoriteLine.oninput = e =>
  pLine.innerText =
    e.target.value || 'a line that stayed with you…';

lineFont.oninput = e =>
  pLine.className = `line ${e.target.value}`;

ost.oninput = e =>
  pOst.innerHTML =
    `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;

remind.oninput = e =>
  pRemind.innerHTML =
    `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;


// ========================================
// CREATE FILM CARD
// ========================================

function createFilmCard(film) {

  const card = document.createElement('div');

  card.className = 'film-card';

  card.innerHTML = `
    <h3 class="film-title">
      ${film.title}
    </h3>

    <div class="meta">
      <span>🎬 ${film.watch_count || 0}</span>
      <span>${film.mood || '🙂'}</span>
    </div>

    <p class="line ${film.font || 'leckerli'}">
      ${film.quote || ''}
    </p>

    <ul class="details">

      <li>
        <strong>Favorite OST:</strong>
        ${film.ost || '—'}
      </li>

      <li>
        <strong>Reminds me of:</strong>
        ${film.reminds_me_of || '—'}
      </li>

    </ul>
  `;

  cardGrid.prepend(card);
}


// ========================================
// LOAD FILMS FROM SUPABASE
// ========================================

async function loadFilms() {

  const { data, error } = await supabaseClient
    .from('Films')
    .select('*')
    .order('id', { ascending: false });

  if (error) {

    console.error('Error loading films:', error);

    return;
  }

  // Clear existing cards first
  cardGrid.innerHTML = '';

  // Display every film from Supabase
  data.forEach(film => {
    createFilmCard(film);
  });
}


// ========================================
// ADD FILM TO SUPABASE
// ========================================

addCard.onclick = async () => {

  // Don't add a film without a title
  if (!filmName.value.trim()) {
    return;
  }


  // Create the film object
  const film = {

    title: filmName.value.trim(),

    watch_count:
      Number(watchCount.value) || 0,

    mood:
      emoji.value,

    quote:
      favoriteLine.value.trim(),

    font:
      lineFont.value,

    ost:
      ost.value.trim(),

    reminds_me_of:
      remind.value.trim()
  };


  // Send the film to Supabase
  const { data, error } = await supabaseClient
    .from('Films')
    .insert([film])
    .select();


  // If something went wrong
  if (error) {

    console.error('Error adding film:', error);

    alert(
      'Something went wrong while saving your film. Please check the console.'
    );

    return;
  }


  // If successful
  console.log('Film saved:', data);


  // Display the newly added film
  createFilmCard(data[0]);


  // Clear the form
  filmName.value = '';
  watchCount.value = '';
  favoriteLine.value = '';
  ost.value = '';
  remind.value = '';


  // Reset preview
  pFilm.innerText = 'Film Name';
  pCount.innerText = '🎬 Watch Count: 0';
  pLine.innerText = 'a line that stayed with you…';
  pOst.innerHTML = '<strong>Favorite OST:</strong> —';
  pRemind.innerHTML = '<strong>Reminds me of:</strong> —';
};


// ========================================
// START FILMO
// ========================================

loadFilms();
