// 1. Supabase 配置
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 页面启动逻辑
document.addEventListener('DOMContentLoaded', () => {
  console.log("Movie Mood 启动中...");

  // --- TAB 切换 ---
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.onclick = () => {
      const targetId = tab.getAttribute('data-tab');
      console.log("切换到:", targetId);

      // 切换按钮状态
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 切换内容显示
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId) {
          content.classList.add('active');
        }
      });
    };
  });

  // --- 实时预览 ---
  const inputs = ['filmName', 'watchCount', 'emoji', 'favoriteLine', 'lineFont', 'ost', 'remind'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.oninput = () => {
        document.getElementById('pFilm').innerText = document.getElementById('filmName').value || 'Film Name';
        document.getElementById('pCount').innerText = `🎬 Watch Count: ${document.getElementById('watchCount').value || 0}`;
        document.getElementById('pEmoji').innerText = document.getElementById('emoji').value;
        document.getElementById('pLine').innerText = document.getElementById('favoriteLine').value || 'a line that stayed with you…';
        document.getElementById('pLine').className = `line ${document.getElementById('lineFont').value}`;
        document.getElementById('pOst').innerHTML = `<strong>Favorite OST:</strong> ${document.getElementById('ost').value || '—'}`;
        document.getElementById('pRemind').innerHTML = `<strong>Reminds me of:</strong> ${document.getElementById('remind').value || '—'}`;
      };
    }
  });

  // --- 初始化加载数据 ---
  loadFilms();
});

// 3. 加载电影函数
async function loadFilms() {
  const cardGrid = document.getElementById('cardGrid');
  const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });

  if (error) {
    console.error("加载失败:", error);
    return;
  }

  cardGrid.innerHTML = ''; 
  data.forEach(film => {
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
    cardGrid.appendChild(card);
  });
}

// 4. 保存电影函数
document.getElementById('addCard').onclick = async () => {
  const name = document.getElementById('filmName').value;
  if (!name) {
    alert("写个电影名吧！");
    return;
  }

  const filmData = {
    title: name,
    watch_count: Number(document.getElementById('watchCount').value) || 0,
    mood: document.getElementById('emoji').value,
    quote: document.getElementById('favoriteLine').value,
    font: document.getElementById('lineFont').value,
    ost: document.getElementById('ost').value || '—',
    reminds_me_of: document.getElementById('remind').value || '—'
  };

  const { error } = await supabase.from('Films').insert([filmData]);

  if (error) {
    alert("保存出错了: " + error.message);
  } else {
    alert("保存成功！✨");
    document.getElementById('movieForm').reset();
    loadFilms(); // 重新加载列表
    document.querySelector('[data-tab="explore"]').click(); // 自动跳转回列表页
  }
};
