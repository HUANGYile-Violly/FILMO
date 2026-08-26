// 1. 初始化 Supabase (记得替换你的 Key)
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = '把你的 publishable key 放这里'; 
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// 获取 DOM 元素 (为了防止报错，显式获取一下)
const cardGrid = document.getElementById('cardGrid');
const addCardBtn = document.getElementById('addCard');

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
// 云端数据处理
// ========================================

// 把数据渲染成 HTML 卡片的函数
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
    <ul class="details">
      <li><strong>Favorite OST:</strong> ${film.ost || '—'}</li>
      <li><strong>Reminds me of:</strong> ${film.reminds_me_of || '—'}</li>
    </ul>
  `;
  cardGrid.prepend(card);
}

// 从 Supabase 加载所有电影
async function loadFilms() {
  const { data, error } = await supabaseClient
    .from('Films') // 确保你 Supabase 表名叫 Films
    .select('*')
    .order('created_at', { ascending: false }); // 如果你有 created_at 字段，按时间倒序

  if (error) {
    console.error('加载失败:', error);
    return;
  }

  cardGrid.innerHTML = ''; // 清空加载动画
  data.forEach(film => createFilmCard(film));
}

// 点击按钮保存到 Supabase
addCardBtn.onclick = async () => {
  if (!filmName.value.trim()) {
    alert("请填写电影名字！");
    return;
  }

  const filmData = {
    title: filmName.value.trim(),
    watch_count: Number(watchCount.value) || 0,
    mood: emoji.value,
    quote: favoriteLine.value.trim(),
    font: lineFont.value,
    ost: ost.value.trim(),
    reminds_me_of: remind.value.trim()
  };

  const { data, error } = await supabaseClient
    .from('Films')
    .insert([filmData])
    .select();

  if (error) {
    alert('保存失败，请检查控制台！');
    console.error(error);
  } else {
    // 成功后：在页面上显示新卡片
    createFilmCard(data[0]);
    
    // 清空输入框和预览
    document.querySelector('.movie-form').reset();
    resetPreview();

    // 自动跳回浏览页（可选）
    // document.querySelector('[data-tab="explore"]').click();
  }
};

function resetPreview() {
  pFilm.innerText = 'Film Name';
  pCount.innerText = '🎬 Watch Count: 0';
  pLine.innerText = 'a line that stayed with you…';
  pOst.innerHTML = '<strong>Favorite OST:</strong> —';
  pRemind.innerHTML = '<strong>Reminds me of:</strong> —';
}

// 初始化加载
loadFilms();
