// 1. 配置 Supabase (使用你提供的 Key)
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 获取所有的 DOM 元素 (这是防止点不动的关键！)
const filmName = document.getElementById('filmName');
const watchCount = document.getElementById('watchCount');
const emoji = document.getElementById('emoji');
const favoriteLine = document.getElementById('favoriteLine');
const lineFont = document.getElementById('lineFont');
const ost = document.getElementById('ost');
const remind = document.getElementById('remind');
const addCardBtn = document.getElementById('addCard');
const cardGrid = document.getElementById('cardGrid');

const pFilm = document.getElementById('pFilm');
const pCount = document.getElementById('pCount');
const pEmoji = document.getElementById('pEmoji');
const pLine = document.getElementById('pLine');
const pOst = document.getElementById('pOst');
const pRemind = document.getElementById('pRemind');

// ========================================
// TAB 切换逻辑
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
// LIVE PREVIEW 实时预览
// ========================================
filmName.oninput = e => pFilm.innerText = e.target.value || 'Film Name';
watchCount.oninput = e => pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;
emoji.oninput = e => pEmoji.innerText = e.target.value;
favoriteLine.oninput = e => pLine.innerText = e.target.value || 'a line that stayed with you…';
lineFont.oninput = e => pLine.className = `line ${e.target.value}`;
ost.oninput = e => pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;
remind.oninput = e => pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;

// ========================================
// 渲染卡片的函数 (统一调用)
// ========================================
function renderCard(film) {
  const card = document.createElement('div');
  card.className = 'film-card';
  card.innerHTML = `
    <h3 class="film-title">${film.title}</h3>
    <div class="meta">
      <span>🎬 ${film.watch_count || 0}</span>
      <span>${film.mood || '🙂'}</span>
    </div>
    <p class="line ${film.font || 'leckerli'}">${film.quote || ''}</p>
    <ul class="details" style="list-style:none; padding:0; border-top:1px dashed #ccc; margin-top:10px; padding-top:10px;">
      <li><strong>Favorite OST:</strong> ${film.ost || '—'}</li>
      <li><strong>Reminds me of:</strong> ${film.reminds_me_of || '—'}</li>
    </ul>
  `;
  cardGrid.prepend(card);
}

// ========================================
// 加载数据 (从 Supabase 读取)
// ========================================
async function loadFilms() {
  const { data, error } = await supabase
    .from('Films')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("加载失败:", error);
    return;
  }
  
  cardGrid.innerHTML = ''; // 清空加载提示
  data.forEach(film => renderCard(film));
}

// ========================================
// 添加数据 (保存到 Supabase)
// ========================================
addCardBtn.onclick = async () => {
  if (!filmName.value) return;

  const newFilm = {
    title: filmName.value,
    watch_count: Number(watchCount.value) || 0,
    mood: emoji.value,
    quote: favoriteLine.value,
    font: lineFont.value,
    ost: ost.value || '—',
    reminds_me_of: remind.value || '—'
  };

  // 1. 发送到云端
  const { data, error } = await supabase
    .from('Films')
    .insert([newFilm])
    .select();

  if (error) {
    alert("保存失败: " + error.message);
  } else {
    // 2. 成功后在本地渲染
    renderCard(data[0]);
    // 3. 重置表单
    document.getElementById('movieForm').reset();
    // 4. 重置预览
    pFilm.innerText = 'Film Name';
    alert("Saved to cloud! ✨");
  }
};

// 启动页面加载数据
loadFilms();
