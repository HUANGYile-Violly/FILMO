// TAB SWITCHING
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// LIVE PREVIEW
filmName.oninput = e => pFilm.innerText = e.target.value || 'Film Name';

watchCount.oninput = e =>
  pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;

emoji.oninput = e => pEmoji.innerText = e.target.value;

favoriteLine.oninput = e =>
  pLine.innerText = e.target.value || 'a line that stayed with you…';

lineFont.oninput = e =>
  pLine.className = `line ${e.target.value}`;

ost.oninput = e =>
  pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;

remind.oninput = e =>
  pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;

// ADD CARD TO EXPLORE
addCard.onclick = () => {
  if (!filmName.value) return;

  const card = document.createElement('div');
  card.className = 'film-card';

  card.innerHTML = `
    <h3 class="film-title">${filmName.value}</h3>
    <div class="meta">
      <span>🎬 ${watchCount.value || 0}</span>
      <span>${emoji.value}</span>
    </div>
    <p class="line ${lineFont.value}">${favoriteLine.value || ''}</p>
    <ul class="details">
      <li><strong>Favorite OST:</strong> ${ost.value || '—'}</li>
      <li><strong>Reminds me of:</strong> ${remind.value || '—'}</li>
    </ul>
  `;

  cardGrid.prepend(card);
};
