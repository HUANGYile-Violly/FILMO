// ========================================
// 1. 获取所有需要的 DOM 元素
// ========================================
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const fName = document.getElementById('filmName');
const fCount = document.getElementById('watchCount');
const fEmoji = document.getElementById('emoji');
const fLine = document.getElementById('favoriteLine');
const fFont = document.getElementById('lineFont');
const fOst = document.getElementById('ost');
const fRemind = document.getElementById('remind');

const btnAddCard = document.getElementById('addCard');
const cardGrid = document.getElementById('cardGrid');

// ========================================
// 2. TAB 切换逻辑 (放在最前面，确保能点动)
// ========================================
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    console.log('Tab clicked:', tab.dataset.tab); // 调试用
    
    // 移除所有 active
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // 给当前点中的加 active
    tab.classList.add('active');
    const targetContent = document.getElementById(tab.dataset.tab);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  });
});

// ========================================
// 3. LIVE PREVIEW 实时预览
// ========================================
if (fName) {
  fName.oninput = e => document.getElementById('pFilm').innerText = e.target.value || 'Film Name';
  fCount.oninput = e => document.getElementById('pCount').innerText = `🎬 Watch Count: ${e.target.value || 0}`;
  fEmoji.oninput = e => document.getElementById('pEmoji').innerText = e.target.value;
  fLine.oninput = e => document.getElementById('pLine').innerText = e.target.value || 'a line that stayed with you…';
  fFont.oninput = e => document.getElementById('pLine').className = `line ${e.target.value}`;
  fOst.oninput = e => document.getElementById('pOst').innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;
  fRemind.oninput = e => document.getElementById('pRemind').innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;
}

// ========================================
// 4. SUPABASE 逻辑 (放在最后，报错也不会影响 Tab)
// ========================================
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = '把你的anon_public_key粘贴到这里'; // <--- 记得改这里！！

let supabase = null;

// 尝试初始化 Supabase
try {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase initialized!");
    loadFilms(); // 初始化成功后加载数据
  } else {
    console.error("Supabase library not found!");
  }
} catch (err) {
  console.error("Supabase init error:", err);
}

// 渲染卡片的函数
function createFilmCard(film) {
  if (!cardGrid) return;
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

// 加载数据
async function loadFilms() {
  if (!supabase) return;
  const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
  if (error) {
    console.error('Error loading:', error);
  } else {
    cardGrid.innerHTML = ''; 
    data.forEach(film => createFilmCard(film));
  }
}

// 保存数据
if (btnAddCard) {
  btnAddCard.onclick = async () => {
    if (!supabase) {
      alert("Cloud database not connected!");
      return;
    }
    if (!fName.value.trim()) {
      alert("Please enter a movie name!");
      return;
    }

    const filmData = {
      title: fName.value.trim(),
      watch_count: Number(fCount.value) || 0,
      mood: fEmoji.value,
      quote: fLine.value.trim(),
      font: fFont.value,
      ost: fOst.value.trim(),
      reminds_me_of: fRemind.value.trim()
    };

    const { data, error } = await supabase.from('Films').insert([filmData]).select();

    if (error) {
      console.error(error);
      alert("Save failed: " + error.message);
    } else {
      createFilmCard(data[0]);
      document.getElementById('movieForm').reset();
      // 重置预览
      document.getElementById('pFilm').innerText = 'Film Name';
      alert("Saved! ✨");
    }
  };
}
