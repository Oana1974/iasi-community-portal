// ===== Events list (AJAX) =====
const yearEl = document.getElementById("fYear");
const qEl    = document.getElementById("fQuery");
const list   = document.getElementById("eventList");
const yParam = new URLSearchParams(location.search).get("year");
if (yParam && yearEl) yearEl.value = yParam;

// helpers
function esc(s){ return (s||"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function fmtDate(iso, t){
  const d = new Date(`${iso}${t ? 'T'+t : ''}`);
  return isNaN(d) ? iso : d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
}
function getSelectedCats(){
  return [...document.querySelectorAll('input[name="cat"]:checked')].map(x => x.value);
}

// small UX helper
function setLoading(){
  if (!list) return;
  list.innerHTML = `<li class="event-empty"><em>Loading…</em></li>`;
}

// main loader
async function load(){
  setLoading();

  const u = new URL(location.origin + "/api/events");
  u.searchParams.set("year", yearEl?.value || "All");

  const cats = getSelectedCats();
  if (cats.length) u.searchParams.set("cats", cats.join(","));

  const q = qEl?.value.trim();
  if (q) u.searchParams.set("q", q);

  try{
    const r = await fetch(u);
    const data = await r.json();

    list.innerHTML = data.length ? data.map(e => `
      <li class="event-card">
        <img src="${esc(e.image || '/img/placeholder.jpg')}" alt="">
        <div>
          <h3><a href="/events/${e.id}">${esc(e.title)}</a></h3>
          <p class="meta">${fmtDate(e.date, e.time)} · ${esc(e.location||'')}${e.category?' · '+esc(e.category):''}</p>
          <p>${esc(e.description||'').slice(0,140)}${(e.description||'').length>140?'…':''}</p>
        </div>
      </li>
    `).join("") : `<li class="event-empty"><em>No events found</em></li>`;
  } catch {
    list.innerHTML = `<li class="event-empty"><em>Network error</em></li>`;
  }
}

// wire up filters (with tiny debounce for typing)
yearEl?.addEventListener("change", load);
qEl?.addEventListener("input", () => { clearTimeout(load._t); load._t = setTimeout(load, 200); });
document.querySelectorAll('input[name="cat"]').forEach(cb => cb.addEventListener("change", load));

// initial load
load();

