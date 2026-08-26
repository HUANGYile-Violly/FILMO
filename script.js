// ==========================================
// 1. 变量定义 (严禁直接用 ID 名，必须显式获取)
// ==========================================
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';

// 等待页面完全加载
window.onload = () => {
    console.log("Movie Mood is active!");

    // --- A. TAB 切换 (最核心) ---
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.getAttribute('data-tab');
            console.log("Switching to:", target);
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        };
    });

    // --- B. LIVE PREVIEW (实时预览) ---
    const fName = document.getElementById('filmName');
    const fCount = document.getElementById('watchCount');
    const fEmoji = document.getElementById('emoji');
    const fLine = document.getElementById('favoriteLine');
    const fFont = document.getElementById('lineFont');
    const fOst = document.getElementById('ost');
    const fRemind = document.getElementById('remind');

    const pFilm = document.getElementById('pFilm');
    const pCount = document.getElementById('pCount');
    const pEmoji = document.getElementById('pEmoji');
    const pLine = document.getElementById('pLine');
    const pOst = document.getElementById('pOst');
    const pRemind = document.getElementById('pRemind');

    if (fName) {
        fName.oninput = e => pFilm.innerText = e.target.value || 'Film Name';
        fCount.oninput = e => pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;
        fEmoji.oninput = e => pEmoji.innerText = e.target.value;
        fLine.oninput = e => pLine.innerText = e.target.value || 'a line that stayed with you…';
        fFont.oninput = e => pLine.className = `line ${e.target.value}`;
        fOst.oninput = e => pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;
        fRemind.oninput = e => pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;
    }

    // --- C. SUPABASE 初始化 ---
    let supabase = null;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        loadFilms(supabase);
    } catch (err) {
        console.error("Supabase failed to init, but UI will work.");
    }

    // --- D. 添加卡片 ---
    const addBtn = document.getElementById('addCard');
    if (addBtn) {
        addBtn.onclick = async () => {
            if (!fName.value) {
                alert("Please at least name the film!");
                return;
            }

            const newFilm = {
                title: fName.value,
                watch_count: Number(fCount.value) || 0,
                mood: fEmoji.value,
                quote: fLine.value,
                font: fFont.value,
                ost: fOst.value || '—',
                reminds_me_of: fRemind.value || '—'
            };

            // 本地先加一张卡片，不等云端返回，让用户感觉“快”
            renderCard(newFilm);

            // 尝试发送到云端
            if (supabase) {
                const { error } = await supabase.from('Films').insert([newFilm]);
                if (error) console.error("Cloud save error:", error);
            }
            
            // 重置
            document.getElementById('movieForm').reset();
            pFilm.innerText = 'Film Name';
            alert("Added to your collection!");
        };
    }
};

// 渲染函数
function renderCard(film) {
    const grid = document.getElementById('cardGrid');
    if (!grid) return;
    
    // 如果有加载文字，删掉它
    const loading = document.getElementById('loadingText');
    if (loading) loading.remove();

    const card = document.createElement('div');
    card.className = 'film-card';
    card.innerHTML = `
        <h3 class="film-title">${film.title}</h3>
        <div class="meta">
            <span>🎬 ${film.watch_count || 0}</span>
            <span>${film.mood || '🙂'}</span>
        </div>
        <p class="line ${film.font || 'leckerli'}">${film.quote || ''}</p>
        <ul class="details" style="list-style:none; padding:0; border-top:1px dashed #ccc; margin-top:10px; padding-top:10px; font-size:14px;">
            <li><strong>Favorite OST:</strong> ${film.ost || '—'}</li>
            <li><strong>Reminds me of:</strong> ${film.reminds_me_of || '—'}</li>
        </ul>
    `;
    grid.prepend(card);
}

// 加载函数
async function loadFilms(supabase) {
    const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
    if (!error && data) {
        const grid = document.getElementById('cardGrid');
        grid.innerHTML = ''; // 清空
        data.forEach(film => renderCard(film));
    }
}
