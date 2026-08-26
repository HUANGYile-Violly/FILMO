// 1. 初始化 Supabase
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = '把你的anon_public_key粘贴到这里'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 获取 DOM
const cardGrid = document.getElementById('cardGrid');
const movieForm = document.getElementById('movieForm');

// ========================================
// 1. TAB 切换 (保持你最初的逻辑)
// ========================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ========================================
// 2. LIVE PREVIEW (保持你最初的逻辑)
// ========================================
filmName.oninput = e => pFilm.innerText = e.target.value || 'Film Name';
watchCount.oninput = e => pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;
emoji.oninput = e => pEmoji.innerText = e.target.value;
favoriteLine.oninput = e => pLine.innerText = e.target.value || 'a line that stayed with you…';
lineFont.oninput = e => pLine.className = `line ${e.target.value}`;
ost.oninput = e => pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;
remind.oninput = e => pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;

// ========================================
// 3. 云端功能
// ========================================

// 渲染卡片的 HTML 结构 (适配你的 CSS)
function createFilmCard(film) {
  const card = document.createElement('div');
  card.className = 'film-card';
  card.innerHTML = `
    <h3 class="film-title">${film.title}</h3>
    <div class="meta">
      <span>🎬 ${film.watch_count || 0}</span>
      <span>${film.mood || '🙂'}</span>
    </div>
    <p class="line ${film.font || 'leckerli'}">${film.quote || ''}</p>
    <ul class="details" style="list-style:none; padding:0; border-top:1px solid #eee; margin-top:10px; padding-top:10px; font-size:0.85rem;">
      <li><strong>Favorite OST:</strong> ${film.ost || '—'}</li>
      <li><strong>Reminds me of:</strong> ${film.reminds_me_of || '—'}</li>
    </ul>
  `;
  cardGrid.prepend(card);
}

// 加载
async function loadFilms() {
  const { data, error } = await supabase
    .from('Films')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error loading:', error);
    return;
  }
  cardGrid.innerHTML = ''; 
  data.forEach(film => createFilmCard(film));
}

// 保存
addCard.onclick = async () => {
  if (!filmName.value.trim()) return;

  const filmData = {
    title: filmName.value.trim(),
    watch_count: Number(watchCount.value) || 0,
    mood: emoji.value,
    quote: favoriteLine.value.trim(),
    font: lineFont.value,
    ost: ost.value.trim(),
    reminds_me_of: remind.value.trim()
  };

  const { data, error } = await supabase.from('Films').insert([filmData]).select();

  if (error) {
    alert("Save failed!");
  } else {
    createFilmCard(data[0]); // 成功后添加卡片
    movieForm.reset();       // 重置表单
    resetPreview();          // 重置预览
    alert("Saved to Cloud! ✨");
  }
};

function resetPreview() {
  pFilm.innerText = 'Film Name';
  pCount.innerText = '🎬 Watch Count: 0';
  pLine.innerText = 'a line that stayed with you…';
  pOst.innerHTML = '<strong>Favorite OST:</strong> —';
  pRemind.innerHTML = '<strong>Reminds me of:</strong> —';
}

// 启动
loadFilms();
