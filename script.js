const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';

window.onload = () => {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // --- 防乱码 Emoji 注入 ---
    const emojiCodes = [0x1F642, 0x1F600, 0x1F60C, 0x1F979, 0x1F972, 0x1F62D, 0x1F614, 0x1F610, 0x1F636, 0x1F643, 0x1F635, 0x1F90D, 0x1F49B, 0x1F5A4, 0x2728];
    const emojiSelect = document.getElementById('emoji');
    if (emojiSelect) {
        emojiSelect.innerHTML = '';
        emojiCodes.forEach(code => {
            const char = String.fromCodePoint(code);
            const opt = document.createElement('option');
            opt.value = char; opt.innerText = char;
            emojiSelect.appendChild(opt);
        });
    }

    const ICON_FILM = String.fromCodePoint(0x1F3AC); 
    const ICON_HEART = String.fromCodePoint(0x2764); 
    const ICON_SAVE = String.fromCodePoint(0x1F4E5);

    const formatDate = (date) => {
        return new Date(date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- TAB 切换 ---
    document.querySelectorAll('.tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        };
    });

    // --- LIVE PREVIEW ---
    const fields = ['userName', 'filmName', 'watchCount', 'emoji', 'favoriteLine', 'lineFont', 'ost', 'thoughts'];
    const inputs = {};
    fields.forEach(f => inputs[f] = document.getElementById(f));

    const pUser = document.getElementById('pUser');
    const pDate = document.getElementById('pDate');
    const pFilm = document.getElementById('pFilm');
    const pCount = document.getElementById('pCount');
    const pEmoji = document.getElementById('pEmoji');
    const pLine = document.getElementById('pLine');
    const pOst = document.getElementById('pOst');
    const pThoughts = document.getElementById('pThoughts');

    if(pDate) pDate.innerText = formatDate();

    const updatePreview = () => {
        if(pUser) pUser.innerText = (inputs.userName.value || 'stranger').toLowerCase();
        if(pFilm) pFilm.innerText = inputs.filmName.value || 'Film Name';
        if(pCount) pCount.innerText = `${ICON_FILM} count: ${inputs.watchCount.value || 0}`;
        if(pEmoji) pEmoji.innerText = inputs.emoji.value;
        if(pLine) {
            pLine.innerText = inputs.favoriteLine.value || 'a line that stayed with you...';
            pLine.className = `line ${inputs.lineFont.value}`;
        }
        if(pOst) pOst.innerHTML = `<strong>Favorite OST:</strong> ${inputs.ost.value || '-'}`;
        if(pThoughts) pThoughts.innerHTML = `<strong>Thoughts:</strong> ${inputs.thoughts.value || '-'}`;
    };

    Object.values(inputs).forEach(el => { if(el) el.oninput = updatePreview; });

    // --- RENDER CARD ---
    function renderCard(film, targetId = 'cardGrid') {
        const grid = document.getElementById(targetId);
        if (!grid) return;
        const loading = document.getElementById('loadingText');
        if (loading) loading.remove();

        const dateStr = formatDate(film.created_at);
        const cardId = `card-${film.id || Math.random().toString(36).substr(2, 9)}`;

        const card = document.createElement('div');
        card.className = 'film-card';
        card.id = cardId;
        card.innerHTML = `
            <div class="card-header-info">${(film.user_name || 'stranger').toLowerCase()} <span class="sep">/</span> ${dateStr}</div>
            <h3 class="film-title">${film.title}</h3>
            <div class="meta">
                <span>${ICON_FILM} ${film.watch_count || 0}</span>
                <span class="mood-emoji">${film.mood || '🙂'}</span>
            </div>
            <p class="line ${film.font || 'leckerli'}">${film.quote || ''}</p>
            <ul class="details">
                <li><strong>Favorite OST:</strong> ${film.ost || '-'}</li>
                <li><strong>Thoughts:</strong> ${film.thoughts || '-'}</li>
            </ul>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <button class="like-btn" onclick="likeFilm(${film.id}, '${cardId}')">
                    ${ICON_HEART} <small>${film.likes || 0}</small>
                </button>
                ${targetId === 'cardGrid' ? `<button class="save-btn" onclick="saveImg('${cardId}')">${ICON_SAVE} Save Image</button>` : ''}
            </div>
        `;
        if(targetId === 'sliderTrack') grid.appendChild(card);
        else grid.prepend(card);
    }

    // --- LIKE ---
    window.likeFilm = async (id, cardId) => {
        if(!id || isNaN(id)) return;
        const btn = document.getElementById(cardId).querySelector('.like-btn');
        if(btn.classList.contains('liked')) return;
        const count = btn.querySelector('small');
        const newLikes = parseInt(count.innerText) + 1;
        count.innerText = newLikes;
        btn.classList.add('liked');
        await supabase.from('Films').update({ likes: newLikes }).eq('id', id);
    };

    // --- AI GHOST WRITER (防止重复逻辑) ---
    async function ghostWriter() {
        // 先检查本地是否已经标记过“AI已发帖”，防止循环调用
        if (sessionStorage.getItem('ghostDone')) return;
        sessionStorage.setItem('ghostDone', 'true');

        const ghosts = [
            { user_name: "blue_velvet", title: "Mulholland Drive", watch_count: 5, mood: "😵‍💫", quote: "Silencio.", font: "pacifico", ost: "Llorando", thoughts: "A dream within a dream.", likes: 12 },
            { user_name: "jules_99", title: "About Time", watch_count: 10, mood: "😌", quote: "We're all traveling through time together.", font: "ubuntu", ost: "How Long Will I Love You", thoughts: "Makes me want to call my dad.", likes: 8 }
        ];
        const story = ghosts[Math.floor(Math.random() * ghosts.length)];
        await supabase.from('Films').insert([story]);
        location.reload();
    }

    // --- LOAD & SAVE ---
    async function loadData() {
        const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
        if (data) {
            document.getElementById('cardGrid').innerHTML = '';
            data.forEach(f => renderCard(f, 'cardGrid'));
            // 轮播图
            const track = document.getElementById('sliderTrack');
            const dots = document.getElementById('sliderDots');
            if(track && data.length > 0) {
                track.innerHTML = ''; dots.innerHTML = '';
                data.slice(0, 5).forEach((f, i) => {
                    renderCard(f, 'sliderTrack');
                    const dot = document.createElement('div');
                    dot.className = `dot ${i===0?'active':''}`;
                    dot.onclick = () => {
                        track.style.transform = `translateX(-${i * 100}%)`;
                        document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx===i));
                    };
                    dots.appendChild(dot);
                });
            }
            // 内容太少自动触发 AI
            if (data.length < 3) ghostWriter();
        }
    }

    document.getElementById('addCard').onclick = async () => {
        if (!inputs.filmName.value) return alert("Please name the film!");
        const newFilm = {
            user_name: (inputs.userName.value || 'stranger').toLowerCase(),
            title: inputs.filmName.value,
            watch_count: Number(inputs.watchCount.value) || 0,
            mood: inputs.emoji.value,
            quote: inputs.favoriteLine.value,
            font: inputs.lineFont.value,
            ost: inputs.ost.value || '-',
            thoughts: inputs.thoughts.value || '-',
            likes: 0
        };
        const { error } = await supabase.from('Films').insert([newFilm]);
        if (error) alert("Save failed: " + error.message + "\n请务必检查数据库是否有 user_name, thoughts, likes 这三列！");
        else location.reload();
    };

    loadData();
};

window.saveImg = (id) => {
    const el = document.getElementById(id);
    const actions = el.querySelector('.card-actions');
    const saveBtn = el.querySelector('.save-btn');
    if(saveBtn) saveBtn.style.visibility = 'hidden';
    html2canvas(el, { backgroundColor: '#ffffff', scale: 2 }).then(canvas => {
        const a = document.createElement('a');
        a.download = `FILMO-${Date.now()}.png`;
        a.href = canvas.toDataURL();
        a.click();
        if(saveBtn) saveBtn.style.visibility = 'visible';
    });
};
