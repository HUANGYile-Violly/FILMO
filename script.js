const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';

window.onload = () => {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- 图标与防乱码 Emoji ---
    const ICON_FILM = String.fromCodePoint(0x1F3AC); 
    const ICON_HEART = String.fromCodePoint(0x2764); 
    const ICON_SAVE = String.fromCodePoint(0x1F4E5);

    // 修复：只保留一个 emojiCodes 声明
    const emojiCodes = [
        0x1F642, 0x1F600, 0x1F60C, 0x1F979, 0x1F972, 0x1F62D, 0x1F614, 0x1F610,
        0x1F636, 0x1F643, 0x1F635, 0x1F90D, 0x1F49B, 0x1F5A4, 0x2728,
        0x1F921, 0x1F386, 0x1F389, 0x1F64C, 0x1F984, 0x1F47B, 0x1F480, 0x1F9D9, 0x1F383, 0x1F47D, 0x1F916
    ];

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

    // 【日期核心逻辑】：严格读取传入的日期，不随便 new Date()
    const formatDate = (dateValue) => {
        if (!dateValue) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const d = new Date(dateValue);
        // 如果转换失败，兜底当前时间
        const validDate = isNaN(d.getTime()) ? new Date() : d;
        return validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- Tab 切换 ---
    document.querySelectorAll('.tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        };
    });

    // --- Live Preview ---
    const fields = ['userName', 'filmName', 'watchCount', 'emoji', 'favoriteLine', 'lineFont', 'ost', 'thoughts'];
    const inputs = {};
    fields.forEach(f => inputs[f] = document.getElementById(f));
    const pDate = document.getElementById('pDate');
    if(pDate) pDate.innerText = formatDate(); 

    const updatePreview = () => {
        document.getElementById('pUser').innerText = (inputs.userName.value || 'stranger').toLowerCase();
        document.getElementById('pFilm').innerText = inputs.filmName.value || 'Film Name';
        document.getElementById('pCount').innerText = ICON_FILM + " count: " + (inputs.watchCount.value || 0);
        document.getElementById('pEmoji').innerText = inputs.emoji.value;
        document.getElementById('pLine').innerText = inputs.favoriteLine.value || 'a line that stayed with you...';
        document.getElementById('pLine').className = `line ${inputs.lineFont.value}`;
        document.getElementById('pOst').innerHTML = `<strong>Favorite OST:</strong> ${inputs.ost.value || '-'}`;
        document.getElementById('pThoughts').innerHTML = `<strong>Thoughts:</strong> ${inputs.thoughts.value || '-'}`;
    };
    Object.values(inputs).forEach(el => { if(el) el.oninput = updatePreview; });

    // --- RENDER CARD ---
    function renderCard(film, targetId = 'cardGrid') {
        const grid = document.getElementById(targetId);
        if (!grid) return;
        const loading = document.getElementById('loadingText');
        if (loading) loading.style.display = 'none';

        // 核心：读取数据库里的真实创建时间
        const dateStr = formatDate(film.created_at);
        const domCardId = targetId + "-card-" + (film.id || Math.random().toString(36).substr(2, 9));

        const card = document.createElement('div');
        card.className = 'film-card';
        card.id = domCardId;
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
                <li><strong>Thoughts:</strong> ${film.thoughts || film.reminds_me_of || '-'}</li>
            </ul>
            <div class="card-actions" style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <button class="like-btn" data-db-id="${film.id}" onclick="window.likeFilm(${film.id}, '${domCardId}')">
                    ${ICON_HEART} <small>${film.likes || 0}</small>
                </button>
                ${targetId === 'cardGrid' ? `<button class="save-btn" onclick="window.saveImg('${domCardId}')">${ICON_SAVE} Save Image</button>` : ''}
            </div>
        `;
        if(targetId === 'sliderTrack') grid.appendChild(card);
        else grid.prepend(card);
    }

    // --- 点赞同步逻辑 ---
    window.likeFilm = async (id, currentDomId) => {
        if(!id || isNaN(id)) return; 
        const clickedBtn = document.getElementById(currentDomId).querySelector('.like-btn');
        let isLiking = !clickedBtn.classList.contains('liked');
        const allMatchingBtns = document.querySelectorAll(`button[data-db-id="${id}"]`);
        
        let finalCount = 0;
        allMatchingBtns.forEach(btn => {
            const countSpan = btn.querySelector('small');
            let currentLikes = parseInt(countSpan.innerText) || 0;
            if (isLiking) {
                btn.classList.add('liked');
                btn.classList.add('pop-anim');
                finalCount = currentLikes + 1;
                setTimeout(() => btn.classList.remove('pop-anim'), 450);
            } else {
                btn.classList.remove('liked');
                finalCount = Math.max(0, currentLikes - 1);
            }
            countSpan.innerText = finalCount;
        });
        await supabase.from('Films').update({ likes: finalCount }).eq('id', id);
    };

    // --- 社区 AI 自动发帖 (每日随机 1-3 篇) ---
    async function ghostAI(existingFilms) {
        const today = new Date().toDateString();
        // 检查今天是否已经发过了
        if (localStorage.getItem('last_ai_post_date') === today) return;

        const aiPool = [
            { user_name: "jules", title: "About Time", watch_count: 5, mood: "😌", quote: "Live as if you've deliberately come back to this day.", font: "ubuntu", ost: "How Long Will I Love You", thoughts: "Makes me want to call my dad.", likes: 24 },
            { user_name: "wong", title: "In the Mood for Love", watch_count: 8, mood: "💄", quote: "He remembers those vanished years.", font: "leckerli", ost: "Yumeji's Theme", thoughts: "The beauty of unsaid words.", likes: 15 },
            { user_name: "mia", title: "Pulp Fiction", watch_count: 2, mood: "🖤", quote: "That's when you know you've found somebody special.", font: "montserrat", ost: "Girl, You'll Be a Woman Soon", thoughts: "Milkshakes and silence.", likes: 30 },
            { user_name: "finn", title: "Aftersun", watch_count: 3, mood: "🌊", quote: "I think it's nice that we share the same sky.", font: "ubuntu", ost: "Under Pressure", thoughts: "Blurry memories of summer.", likes: 14 },
            { user_name: "link", title: "Before Sunrise", watch_count: 10, mood: "🌙", quote: "Isn't everything we do in life a way to be loved a little more?", font: "pacifico", ost: "Come Here", thoughts: "Viennese streets and eternal talks.", likes: 21 }
        ];

        // 查重：过滤掉已经有的
        const available = aiPool.filter(ai => !existingFilms.some(f => f.title.toLowerCase() === ai.title.toLowerCase()));
        if (available.length === 0) return;

        // 随机选 1-3 篇
        const countToPost = Math.min(available.length, Math.floor(Math.random() * 3) + 1);
        const toPost = available.sort(() => 0.5 - Math.random()).slice(0, countToPost);

        for (const post of toPost) {
            await supabase.from('Films').insert([{ ...post, created_at: new Date().toISOString() }]);
        }
        
        localStorage.setItem('last_ai_post_date', today);
        console.log(`AI posted ${countToPost} new memories.`);
        loadData();
    }

    // --- 数据加载 ---
    async function loadData() {
        const { data, error } = await supabase.from('Films').select('*').order('created_at', { ascending: false });
        if (data) {
            const grid = document.getElementById('cardGrid');
            if(grid) {
                grid.innerHTML = '';
                data.forEach(f => renderCard(f, 'cardGrid'));
            }
            
            const track = document.getElementById('sliderTrack');
            const dots = document.getElementById('sliderDots');
            if(track && data.length > 0) {
                track.innerHTML = ''; dots.innerHTML = '';
                const sliderItems = data.slice(0, 5);
                sliderItems.forEach((f, i) => {
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
            // 运行 AI 逻辑
            ghostAI(data);
        }
    }

    // --- 添加卡片 ---
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
            likes: 0,
            created_at: new Date().toISOString() // 存入当前的精确时间
        };
        const { error } = await supabase.from('Films').insert([newFilm]);
        if (error) alert("Save failed: " + error.message);
        else location.reload();
    };

    loadData();
};

// --- 保存图片 ---
window.saveImg = (id) => {
    const el = document.getElementById(id);
    const btns = el.querySelectorAll('button');
    btns.forEach(b => b.style.visibility = 'hidden');
    html2canvas(el, { backgroundColor: '#ffffff', scale: 2 }).then(canvas => {
        const a = document.createElement('a');
        a.download = `FILMO-${Date.now()}.png`;
        a.href = canvas.toDataURL();
        a.click();
        btns.forEach(b => b.style.visibility = 'visible');
    });
};
