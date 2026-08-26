const SUPABASE_URL = 'https://rjeopfnfuwnzxlcklfne.supabase.co';
const SUPABASE_KEY = 'sb_publishable_QvXjWNuroCn5AXGuIv86CQ_i9UraSnh';

window.onload = () => {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // --- 终极防乱码：代码生成 Emoji 列表 ---
    // 🙂, 😀, 😌, 🥹, 🥲, 😭, 😔, 😐, 😶, 🙃, 😵‍💫, 🤍, 💛, 🖤, ✨
    const emojiCodes = [0x1F642, 0x1F600, 0x1F60C, 0x1F979, 0x1F972, 0x1F62D, 0x1F614, 0x1F610, 0x1F636, 0x1F643, 0x1F635, 0x1F90D, 0x1F49B, 0x1F5A4, 0x2728];
    const emojiSelect = document.getElementById('emoji');
    if (emojiSelect) {
        emojiCodes.forEach(code => {
            const char = String.fromCodePoint(code);
            const opt = document.createElement('option');
            opt.value = char;
            opt.innerText = char;
            emojiSelect.appendChild(opt);
        });
    }

    const ICON_FILM = String.fromCodePoint(0x1F3AC); // 🎬
    const ICON_HEART = String.fromCodePoint(0x2764); // ❤️
    const ICON_SAVE = String.fromCodePoint(0x1F4E5); // 📥

    const formatDate = (date) => {
        const d = date ? new Date(date) : new Date();
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // --- A. TAB ---
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        };
    });

    // --- B. LIVE PREVIEW ---
    const fUser = document.getElementById('userName');
    const fName = document.getElementById('filmName');
    const fCount = document.getElementById('watchCount');
    const fEmoji = document.getElementById('emoji');
    const fLine = document.getElementById('favoriteLine');
    const fFont = document.getElementById('lineFont');
    const fOst = document.getElementById('ost');
    const fThoughts = document.getElementById('thoughts');

    const pUser = document.getElementById('pUser');
    const pDate = document.getElementById('pDate');
    const pFilm = document.getElementById('pFilm');
    const pCount = document.getElementById('pCount');
    const pEmoji = document.getElementById('pEmoji');
    const pLine = document.getElementById('pLine');
    const pOst = document.getElementById('pOst');
    const pThoughts = document.getElementById('pThoughts');

    // 初始设置日期预览
    if(pDate) pDate.innerText = formatDate();

    function updatePreview() {
        if(pUser) pUser.innerText = (fUser.value || 'stranger').toLowerCase();
        if(pFilm) pFilm.innerText = fName.value || 'Film Name';
        if(pCount) pCount.innerText = `${ICON_FILM} count: ${fCount.value || 0}`;
        if(pEmoji) pEmoji.innerText = fEmoji.value;
        if(pLine) {
            pLine.innerText = fLine.value || 'a line that stayed with you...';
            pLine.className = `line ${fFont.value}`;
        }
        if(pOst) pOst.innerHTML = `<strong>Favorite OST:</strong> ${fOst.value || '-'}`;
        if(pThoughts) pThoughts.innerHTML = `<strong>Thoughts:</strong> ${fThoughts.value || '-'}`;
    }

    [fUser, fName, fCount, fEmoji, fLine, fFont, fOst, fThoughts].forEach(el => {
        if(el) el.oninput = updatePreview;
    });

    // --- C. RENDER CARD ---
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
            <div class="card-header-info">
                ${(film.user_name || 'stranger').toLowerCase()} 
                <span class="sep">/</span> 
                ${dateStr}
            </div>
            <h3 class="film-title">${film.title}</h3>
            <div class="meta">
                <span>${ICON_FILM} ${film.watch_count || 0}</span>
                <span class="mood-emoji">${film.mood || String.fromCodePoint(0x1F642)}</span>
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

    // --- D. SLIDER ---
    function startSlider(data) {
        const track = document.getElementById('sliderTrack');
        const dots = document.getElementById('sliderDots');
        if(!track || !data.length) return;
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

    // --- E. LIKE & LOAD ---
    window.likeFilm = async (id, cardId) => {
        if(!id) return;
        const btn = document.getElementById(cardId).querySelector('.like-btn');
        if(btn.classList.contains('liked')) return;
        const count = btn.querySelector('small');
        const newLikes = parseInt(count.innerText) + 1;
        count.innerText = newLikes;
        btn.classList.add('liked');
        await supabase.from('Films').update({ likes: newLikes }).eq('id', id);
    };

    async function loadData() {
        const { data, error } = await supabase.from('Films').select('*').order('id', { ascending: false });
        if (!error && data) {
            document.getElementById('cardGrid').innerHTML = '';
            data.forEach(f => renderCard(f, 'cardGrid'));
            startSlider(data);
        }
    }

    document.getElementById('addCard').onclick = async () => {
        if (!fName.value) return alert("Please name the film!");
        const newFilm = {
            user_name: (fUser.value || 'stranger').toLowerCase(),
            title: fName.value,
            watch_count: Number(fCount.value) || 0,
            mood: fEmoji.value,
            quote: fLine.value,
            font: fFont.value,
            ost: fOst.value || '-',
            thoughts: fThoughts.value || '-',
            likes: 0
        };
        await supabase.from('Films').insert([newFilm]);
        location.reload();
    };

    loadData();
};

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
