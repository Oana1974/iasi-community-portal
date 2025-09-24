console.log('[area-filters] loaded');

const yearSel = document.getElementById('yearSel');
const catBoxes = Array.from(document.querySelectorAll('input[name="cat"]'));
const up = document.getElementById('upcomingGrid');
const past = document.getElementById('pastGrid');

// derive area slug from URL: /area/:slug
const slug = location.pathname.split('/').filter(Boolean)[1];

function card(e, isPast=false) {
  return `
  <article class="card">
    <img src="/img/${e.image || 'opera-open-air.jpg'}" alt="${e.title}" />
    <div class="card-body">
      <h3><a href="/event/${e.id}">${e.title}</a></h3>
      <p class="muted">${e.date} · ${e.location}</p>
      ${isPast ? '<span class="pill">Past</span>' : `<span class="badge">${e.category}</span>`}
    </div>
  </article>`;
}

async function load() {
  const year = yearSel?.value || '';
  const cats = catBoxes.filter(b => b.checked).map(b => b.value).join(',');
  const qs = new URLSearchParams();
  if (year) qs.set('year', year);
  if (cats) qs.set('cats', cats);

  const url = `/api/area/${slug}/events${qs.toString() ? '?' + qs.toString() : ''}`;
  const res = await fetch(url);
  const data = await res.json();

  // render upcoming
  if (data.upcoming?.length) {
    up.innerHTML = data.upcoming.map(e => card(e, false)).join('');
  } else {
    up.innerHTML = '<p class="muted">No upcoming events.</p>';
  }

  // render past
  if (data.past?.length) {
    past.innerHTML = data.past.map(e => card(e, true)).join('');
  } else {
    past.innerHTML = '<p class="muted">No past events yet.</p>';
  }
}

yearSel?.addEventListener('change', load);
catBoxes.forEach(b => b.addEventListener('change', load));

// first load on page ready
document.addEventListener('DOMContentLoaded', load);
