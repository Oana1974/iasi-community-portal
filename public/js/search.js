console.log('[search.js] loaded');

const input = document.getElementById('siteSearch');
const box   = document.getElementById('searchResults');
let t;

function render(items) {
  if (!items || !items.length) {
    box.innerHTML = '<div class="sr-empty">No matches</div>';
    return;
  }
  box.innerHTML = items.map(r => `
    <a class="sr-item" href="/event/${r.id}">
      <strong>${r.title}</strong>
      <small>${r.date} · ${r.location} · ${r.category}</small>
    </a>
  `).join('');
}

async function doSearch(q) {
  const res = await fetch('/api/search?q=' + encodeURIComponent(q));
  const data = await res.json();
  console.log('[search.js] results for', q, data);
  render(data);
}

input?.addEventListener('input', () => {
  clearTimeout(t);
  const q = input.value.trim();
  if (!q) { box.innerHTML = ''; return; }
  t = setTimeout(() => doSearch(q), 200);
});
