let allLessons = [], currentPage = 1, activeCategory = "All", searchKeyword = "";
const lessonsPerPage = 10;
const CATEGORIES = ["All","A1","A2","B1","B2","C1","C2","Complete IELTS",
  "Cambridge 10","Cambridge 11","Cambridge 12","Cambridge 13","Cambridge 14",
  "Cambridge 15","Cambridge 16","Cambridge 17","Cambridge 18","Cambridge 19","Cambridge 20"];

async function fetchLessons() {
  showSkeleton(true);
  try {
    const res = await fetch("data/lessons.json");
    if (!res.ok) throw new Error();
    allLessons = await res.json();
    renderCategoryFilters();
    renderLessonsAndPagination();
  } catch (e) {
    lessonsGrid.innerHTML = `<div class="error-msg">⚠️ Could not load lessons. Ensure data/lessons.json exists.</div>`;
  } finally { showSkeleton(false); }
}
function showSkeleton(show) {
  if (show) lessonsGrid.innerHTML = Array(6).fill().map(()=>'<div class="skeleton-card"></div>').join('');
}
function getFiltered() {
  let f = [...allLessons];
  if (activeCategory !== "All") f = f.filter(l=>l.category===activeCategory);
  if (searchKeyword.trim()) {
    const kw = searchKeyword.toLowerCase();
    f = f.filter(l=>l.title.toLowerCase().includes(kw) || l.description.toLowerCase().includes(kw) || l.category.toLowerCase().includes(kw) || l.level.toLowerCase().includes(kw));
  }
  return f;
}
function renderCategoryFilters() {
  categoryFilterDiv.innerHTML = CATEGORIES.map(c => `<span class="pill ${activeCategory===c?'active':''}" data-category="${c}">${c}</span>`).join('');
  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click",()=>{ activeCategory=pill.dataset.category; currentPage=1; renderCategoryFilters(); renderLessonsAndPagination(); });
  });
}
function renderLessonsAndPagination() {
  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length / lessonsPerPage);
  const start = (currentPage-1)*lessonsPerPage;
  const paginated = filtered.slice(start, start+lessonsPerPage);
  if(paginated.length===0) lessonsGrid.innerHTML = `<div class="no-results"><i class="fas fa-head-side-vr"></i><p>No lessons found.</p></div>`;
  else {
    lessonsGrid.innerHTML = paginated.map(lesson => `
      <div class="card">
        <img class="card-thumb" src="${lesson.thumbnail || 'https://placehold.co/400x200?text=Listening'}" loading="lazy" onerror="this.src='https://placehold.co/400x200?text=Audio+Lesson'">
        <div class="card-content">
          <h3 class="card-title">${escapeHtml(lesson.title)}</h3>
          <p class="card-desc">${escapeHtml(lesson.description.substring(0,80))}...</p>
          <div class="card-meta"><span class="badge">${lesson.category}</span><span class="badge">${lesson.level}</span><span><i class="far fa-clock"></i> ${lesson.duration}</span></div>
          <a href="${lesson.file}" class="btn-lesson">Open Lesson <i class="fas fa-headphones"></i></a>
        </div>
      </div>
    `).join('');
  }
  let pagHTML = '';
  if(totalPages>1){
    pagHTML += `<button class="page-btn" data-page="prev" ${currentPage===1?'disabled':''}><i class="fas fa-chevron-left"></i> Prev</button>`;
    for(let i=1;i<=Math.min(totalPages,5);i++){
      if(i===1 || i===totalPages || (i>=currentPage-1 && i<=currentPage+1))
        pagHTML += `<button class="page-btn ${currentPage===i?'active-page':''}" data-page="${i}">${i}</button>`;
      else if(i===2 && currentPage>3) pagHTML += `<span>...</span>`;
    }
    pagHTML += `<button class="page-btn" data-page="next" ${currentPage===totalPages?'disabled':''}>Next <i class="fas fa-chevron-right"></i></button>`;
  }
  paginationDiv.innerHTML = pagHTML;
  document.querySelectorAll(".page-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const val = btn.dataset.page;
      if(val==="prev") currentPage = Math.max(1, currentPage-1);
      else if(val==="next") currentPage = Math.min(totalPages, currentPage+1);
      else currentPage = parseInt(val);
      renderLessonsAndPagination();
      document.getElementById("listening").scrollIntoView({behavior:"smooth"});
    });
  });
}
function escapeHtml(str){ return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }
function initDarkMode(){
  if(localStorage.getItem("darkMode")==="enabled") document.body.classList.add("dark");
  const toggle=()=>{ document.body.classList.toggle("dark"); localStorage.setItem("darkMode",document.body.classList.contains("dark")?"enabled":"disabled"); };
  darkToggle?.addEventListener("click",toggle);
  darkToggleDesktop?.addEventListener("click",toggle);
}
document.getElementById("globalSearchInput").addEventListener("input", e=>{ searchKeyword=e.target.value; currentPage=1; renderLessonsAndPagination(); });
document.getElementById("startLearningBtn")?.addEventListener("click", e=>{ e.preventDefault(); document.getElementById("listening").scrollIntoView({behavior:"smooth"}); });
window.addEventListener("scroll",()=>{ backToTopBtn.classList.toggle("visible",window.scrollY>500); });
backToTopBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
document.getElementById("menuToggle")?.addEventListener("click",()=>{ document.getElementById("navLinks").classList.toggle("show"); });
const lessonsGrid = document.getElementById("lessonsGrid"), paginationDiv = document.getElementById("paginationControls"), categoryFilterDiv = document.getElementById("categoryFilter");
const darkToggle = document.getElementById("darkModeToggle"), darkToggleDesktop = document.getElementById("darkModeToggleDesktop"), backToTopBtn = document.getElementById("backToTop");
fetchLessons(); initDarkMode();
