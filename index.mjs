import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = new Database(path.join(__dirname, 'db', 'iasi.db'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // parse POST form bodies

function getAreas() {
  return db.prepare(`
    SELECT id, name, slug, description
    FROM areas
    ORDER BY
      CASE slug
        WHEN 'arts' THEN 1
        WHEN 'education' THEN 2
        WHEN 'health' THEN 3
        WHEN 'sports' THEN 4
        ELSE 99
      END
  `).all();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
app.locals.formatDate = formatDate;
// ---- Time formatting helper (HH:MM -> 19:30) ----
function formatTime(timeStr) {
  if (!timeStr) return '';
  // accepts "19:30" or "19:30:00"
  const [h, m = '00'] = String(timeStr).split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
app.locals.formatTime = formatTime;

// HOME
app.get("/", (req, res) => {
  const featured = {
    title: "Open-Air Gala Concert",
    date: "2025-11-15",
    time: "19:30",
    location: "Opera Națională Română Iași",
    id: 1,                          // use an existing event ID from your DB
    slug: "opera-open-air",
    image: "opera-open-air.jpg"
  };
  const areas = getAreas();
res.render("home", { bodyClass: "home", title: "Home", featured, areas });
});

// AREA PAGE: /area/:slug
app.get('/area/:slug', (req, res) => {
  const area = db.prepare('SELECT * FROM areas WHERE slug = ?').get(req.params.slug);
  if (!area) return res.status(404).send('Area not found');

  const upcoming = db.prepare(`
    SELECT * FROM events
    WHERE area_id = ? AND date >= date('now')
    ORDER BY date ASC
  `).all(area.id);

  const past = db.prepare(`
    SELECT * FROM events
    WHERE area_id = ? AND date < date('now')
    ORDER BY date DESC
  `).all(area.id);

  res.render('area', { area, upcoming, past });
});

// EVENT BY ID: /event/:id
app.get('/event/:id', (req, res) => {
  const event = db.prepare(`
    SELECT e.*, a.name AS area_name
    FROM events e JOIN areas a ON a.id = e.area_id
    WHERE e.id = ?
  `).get(Number(req.params.id));
  if (!event) return res.status(404).send('Event not found');
  const occurred = new Date(event.date) < new Date();
  res.render('event', { event, occurred });
});

// FAQ (pass data so faq.ejs never crashes)
app.get("/faq", (req, res) => {
  const faqs = [
    { question: "How do I register for an event?",
      answer: "Open the event page and click the Register/Contact button. Some events link to the organiser’s site." },
    { question: "Are activities free?",
      answer: "Many are free. Paid courses show fees on the card and event page." },
    { question: "Where can I find sports clubs?",
      answer: "Go to Areas → Sports. Club cards list location, schedule and contact." },
    { question: "How can I add my event?",
      answer: "Use Contact → ‘Promote an event’. An admin will review and publish if appropriate." },
    { question: "Accessibility?",
      answer: "Most events are held in step-free venues with accessible restrooms. If you need assistance (wheelchair access, companion tickets, captions), contact us at least 48h before the event." }
  ];
  res.render("faq", { title: "FAQ · Iași Community Portal", faqs });
});

// CONTACT (GET)
app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact · Iași Community Portal",
    errors: [],
    data: { name: "", email: "", message: "" }, // << matches contact.ejs
    saved: false                                 // << matches contact.ejs
  });
});

// CONTACT (POST)
app.post('/contact', (req, res) => {
  const { name = '', email = '', message = '' } = req.body;

  const errors = [];
  if (name.trim().length < 2) errors.push('Please enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.push('Please enter a valid email address.');
  if (message.trim().length < 10) errors.push('Message must be at least 10 characters.');

  if (errors.length) {
    return res.render('contact', {
      title: "Contact · Iași Community Portal",
      errors,
      data: { name, email, message }, // keep the user's input
      saved: false
    });
  }

  const stmt = db.prepare('INSERT INTO contacts(name,email,message) VALUES (?,?,?)');
  stmt.run(name.trim(), email.trim(), message.trim());

  res.render('contact', {
    title: "Contact · Iași Community Portal",
    errors: [],
    data: { name: "", email: "", message: "" }, // reset form
    saved: true
  });
});

// AJAX search: /api/search?q=opera
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const like = `%${q}%`;
  const rows = db.prepare(`
    SELECT e.id, e.title, e.date, e.location, e.category
    FROM events e
    WHERE e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?
    ORDER BY e.date DESC
    LIMIT 20
  `).all(like, like, like);
  res.json(rows);
});

// AJAX: events for an area with optional year + categories
app.get('/api/area/:slug/events', (req, res) => {
  const area = db.prepare('SELECT * FROM areas WHERE slug = ?').get(req.params.slug);
  if (!area) return res.status(404).json({ error: 'Area not found' });

  const year = req.query.year ? String(req.query.year) : null;
  const cats = req.query.cats
    ? String(req.query.cats).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  let where = 'area_id = ?';
  const p1 = [area.id];
  const p2 = [area.id];

  if (year) {
    where += " AND strftime('%Y', date) = ?";
    p1.push(year); p2.push(year);
  }
  if (cats.length) {
    where += ` AND category IN (${cats.map(() => '?').join(',')})`;
    cats.forEach(c => { p1.push(c); p2.push(c); });
  }

  const upcoming = db.prepare(
    `SELECT * FROM events WHERE ${where} AND date >= date('now') ORDER BY date ASC`
  ).all(...p1);

  const past = db.prepare(
    `SELECT * FROM events WHERE ${where} AND date < date('now') ORDER BY date DESC`
  ).all(...p2);

  res.json({ area: { id: area.id, name: area.name, slug: area.slug }, upcoming, past });
});

// Kids Quiz page
app.get("/activity", (req, res) => {
  res.render("activity"); 
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Iași portal running at http://localhost:${PORT}`);
});
