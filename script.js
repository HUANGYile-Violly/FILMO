

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
// 【日期逻辑】：数据库有 created_at 就一定用数据库的时间；只有"预览"（还没存库）时才用当前时间
const formatDate = (dateValue) => {
    const d = dateValue ? new Date(dateValue) : new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
if(pDate) pDate.innerText = formatDate(); // 预览用当前时间，没问题
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
    // 核心：始终读取数据库里的 created_at，不再兜底成 new Date()
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
// --- 点赞逻辑（双卡同步 + Toggle 变色） ---
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
        // 注意：smartGhostWriter 已删除，AI 发帖改由 Supabase Edge Function 每天自动执行
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
        created_at: new Date().toISOString()   // 手动锁定创建时间，双保险
    };
    const { error } = await supabase.from('Films').insert([newFilm]);
    if (error) alert("Save failed: " + error.message);
    else location.reload();
};
loadData();
};
// --- 保存图片（全局） ---
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
