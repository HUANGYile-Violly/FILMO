// 1. Supabase 配置
const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 等待页面加载完成
document.addEventListener('DOMContentLoaded', () => {
    
    // --- TAB 切换 (最优先确保这个能动) ---
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(target);
            if(targetContent) targetContent.classList.add('active');
        });
    });

    // --- 获取所有输入和预览元素 ---
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

    // --- LIVE PREVIEW 实时预览逻辑 ---
    if (filmName) {
        filmName.oninput = e => pFilm.innerText = e.target.value || 'Film Name';
        watchCount.oninput = e => pCount.innerText = `🎬 Watch Count: ${e.target.value || 0}`;
        emoji.oninput = e => pEmoji.innerText = e.target.value;
        favoriteLine.oninput = e => pLine.innerText = e.target.value || 'a line that stayed with you…';
        lineFont.oninput = e => pLine.className = `line ${e.target.value}`;
        ost.oninput = e => pOst.innerHTML = `<strong>Favorite OST:</strong> ${e.target.value || '—'}`;
        remind.oninput = e => pRemind.innerHTML = `<strong>Reminds me of:</strong> ${e.target.value || '—'}`;
    }

    // --- 渲染卡片到页面的函数 ---
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
            <ul class="details" style="list-style:none; padding:0; border-top:1px dashed #ccc; margin-top:10px; padding-top:10px; font-size:14px;">
                <li><strong>Favorite OST:</strong> ${film.ost || '—'}</li>
                <li><strong>Reminds me of:</strong> ${film.reminds_me_of || '—'}</li>
            </ul>
        `;
        cardGrid.prepend(card);
    }

    // --- 从 Supabase 加载数据 ---
    async function loadFilms() {
        try {
            const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
            if (error) throw error;
            if (cardGrid) {
                cardGrid.innerHTML = ''; 
                data.forEach(film => renderCard(film));
            }
        } catch (err) {
            console.error("Cloud load error:", err);
            if(cardGrid) cardGrid.innerHTML = '<p style="text-align:center; padding:20px;">Connection failed, but you can still add local cards.</p>';
        }
    }

    // --- 点击添加按钮 ---
    if (addCardBtn) {
        addCardBtn.onclick = async () => {
            if (!filmName.value) {
                alert("Please enter a film name!");
                return;
            }

            const newFilm = {
                title: filmName.value,
                watch_count: Number(watchCount.value) || 0,
                mood: emoji.value,
                quote: favoriteLine.value,
                font: lineFont.value,
                ost: ost.value || '—',
                reminds_me_of: remind.value || '—'
            };

            try {
                const { data, error } = await supabase.from('Films').insert([newFilm]).select();
                if (error) throw error;
                renderCard(data[0]);
                document.getElementById('movieForm').reset();
                pFilm.innerText = 'Film Name';
                alert("Saved to cloud! ✨");
            } catch (err) {
                console.error("Save error:", err);
                alert("Error saving: " + err.message);
            }
        };
    }

    // 启动加载
    loadFilms();
});
