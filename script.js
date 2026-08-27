const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';

window.onload = () => {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // --- 图标与防乱码 Emoji ---
    const ICON_FILM = String.fromCodePoint(0x1F3AC); 
    const ICON_HEART = String.fromCodePoint(0x2764); 
    const ICON_SAVE = String.fromCodePoint(0x1F4E5);

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

    // 【日期逻辑修复】：如果是数据库里的数据，用数据库的时间；否则（预览时）用当前时间
    const formatDate = (dateValue) => {
        const d = dateValue ? new Date(dateValue) : new Date();
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- Tab 切换 (保留你成功的版本) ---
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

    // --- RENDER CARD (修复日期锁定与 ID 冲突) ---
    function renderCard(film, targetId = 'cardGrid') {
        const grid = document.getElementById(targetId);
        if (!grid) return;
        const loading = document.getElementById('loadingText');
        if (loading) loading.style.display = 'none';

        // 核心：读取数据库真实时间
        const dateStr = formatDate(film.created_at);
        // 给卡片 DOM 起一个独一无二的 ID（区分在 Slider 还是 Grid）
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
                <!-- 增加 data-db-id 属性，用于同步不同区域的红心 -->
                <button class="like-btn" data-db-id="${film.id}" onclick="window.likeFilm(${film.id}, '${domCardId}')">
                    ${ICON_HEART} <small>${film.likes || 0}</small>
                </button>
                ${targetId === 'cardGrid' ? `<button class="save-btn" onclick="window.saveImg('${domCardId}')">${ICON_SAVE} Save Image</button>` : ''}
            </div>
        `;
        if(targetId === 'sliderTrack') grid.appendChild(card);
        else grid.prepend(card);
    }

    // --- 点赞逻辑修复 (双卡同步 + Toggle 变色) ---
    window.likeFilm = async (id, currentDomId) => {
        if(!id || isNaN(id)) return; 

        // 找到当前点击的这个按钮
        const clickedBtn = document.getElementById(currentDomId).querySelector('.like-btn');
        let isLiking = !clickedBtn.classList.contains('liked');

        // 核心：找到全页面所有属于这个数据库 ID 的点赞按钮 (同步 Slider 和 Grid)
        const allMatchingBtns = document.querySelectorAll(`button[data-db-id="${id}"]`);
        
        let finalCount = 0;
        allMatchingBtns.forEach(btn => {
            const countSpan = btn.querySelector('small');
            let currentLikes = parseInt(countSpan.innerText) || 0;

            if (isLiking) {
                btn.classList.add('liked');
                btn.classList.add('pop-anim');
                finalCount = currentLikes + 1;
                // 动画播完移除类，方便下次点
                setTimeout(() => btn.classList.remove('pop-anim'), 450);
            } else {
                btn.classList.remove('liked');
                finalCount = Math.max(0, currentLikes - 1);
            }
            countSpan.innerText = finalCount;
        });

        // 异步存入数据库
        await supabase.from('Films').update({ likes: finalCount }).eq('id', id);
    };

    // --- 智能 AI 幽灵写手 (保留你成功的版本) ---
    async function smartGhostWriter() {
        if (Math.random() > 0.1) return;
        if (sessionStorage.getItem('ghostDone')) return;
        
        const ghosts = [
            { user_name: "blue_velvet", title: "Mulholland Drive", watch_count: 5, mood: "😵‍💫", quote: "Silencio.", font: "pacifico", ost: "Llorando", thoughts: "A dream within a dream.", likes: 12 },
            { user_name: "jules_99", title: "About Time", watch_count: 10, mood: "😌", quote: "Live as if you've deliberately come back to this day.", font: "ubuntu", ost: "How Long Will I Love You", thoughts: "Makes me want to call my dad.", likes: 24 }
        ];
        const story = ghosts[Math.floor(Math.random() * ghosts.length)];
        await supabase.from('Films').insert([story]);
        sessionStorage.setItem('ghostDone', 'true');
        // 不刷新，等下次加载
    }

    // --- 数据加载 ---
    async function loadData() {
        const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
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
            smartGhostWriter();
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
            likes: 0
        };
        const { error } = await supabase.from('Films').insert([newFilm]);
        if (error) alert("Save failed: " + error.message);
        else location.reload();
    };

    loadData();
};

// --- 保存图片 (全局) ---
window.saveImg = (id) => {
    const el = document.getElementById(id);
    const saveBtn = el.querySelector('.save-btn');
    const likeBtn = el.querySelector('.like-btn');
    if(saveBtn) saveBtn.style.visibility = 'hidden';
    if(likeBtn) likeBtn.style.visibility = 'hidden';
    html2canvas(el, { backgroundColor: '#ffffff', scale: 2 }).then(canvas => {
        const a = document.createElement('a');
        a.download = `FILMO-${Date.now()}.png`;
        a.href = canvas.toDataURL();
        a.click();
        if(saveBtn) saveBtn.style.visibility = 'visible';
        if(likeBtn) likeBtn.style.visibility = 'visible';
    });
};
