import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths
const dbPath = path.join(__dirname, 'iasi.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// (re)create database from schema
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new Database(dbPath);
db.exec(fs.readFileSync(schemaPath, 'utf8'));

// --- seed content ---

// Areas
const insArea = db.prepare('INSERT INTO areas(name, slug, description) VALUES (?,?,?)');
[
  ['Sports',     'sports',   'Clubs, fixtures and outdoor activities in Iași.'],
  ['Health',     'health',   'Clinics, fitness, wellness and community health.'],
  ['Education',  'education','Courses, workshops and university events.'],
  ['Arts & Culture','arts',  'Theatre, concerts, galleries and festivals in Iași.']
].forEach(([n,s,d]) => insArea.run(n,s,d));

const ids = Object.fromEntries(
  db.prepare('SELECT id, slug FROM areas').all().map(r => [r.slug, r.id])
);

// --- EVENTS (mix of upcoming + past) ---
const insEvent = db.prepare(`
  INSERT INTO events(area_id,title,description,date,time,location,category,is_featured,image)
  VALUES (?,?,?,?,?,?,?,?,?)
`);

// UPCOMING 
insEvent.run(
  ids.arts,
  'Open-Air Gala Concert – Opera Națională Română Iași',
  'A special autumn gala performance in open space featuring soloists and orchestra.',
  '2025-11-15','20:00','Piața Palatului Culturii, Iași','concert',1,'opera-open-air.jpg'
);
insEvent.run(
  ids.sports,
  'Canoe Race on Aroneanu Lake',
  'Community canoe race with beginner and advanced divisions.',
  '2025-11-07','10:00','Lacul Aroneanu, Iași','sports',0,'aroneanu-canoe.jpg'
);
insEvent.run(
  ids.health,
  'Pilates in the Park',
  'Mat pilates session focused on posture and core strength.',
  '2025-11-05','09:30','Grădina Palas','wellness',0,'pilates-palas.jpg'
);
insEvent.run(
  ids.education,
  'UAIC Open Lecture: Digital Skills for All',
  'Community talk and workshop on practical digital skills.',
  '2025-11-20','17:00','Universitatea „Alexandru Ioan Cuza” din Iași','education',0,'uaic-lecture.jpg'
);

// PAST 
insEvent.run(
  ids.sports,
  'Copou Park Jogging Group',
  'Casual 5 km run; all levels welcome.',
  '2025-09-10','08:30','Parcul Copou','sports',0,'copou-jogging.jpg'
);
insEvent.run(
  ids.sports,
  'Politehnica Iași Home Match – Community Stand',
  'Join local supporters for a family-friendly matchday experience.',
  '2025-10-10','18:00','Stadionul Emil Alexandrescu','sports',0,'poli-iasi.jpg'
);
insEvent.run(
  ids.arts,
  'Iași Winter Chamber Recital',
  'Intimate chamber music evening.',
  '2024-12-12','19:00','Sala Mare, Teatrul Național','concert',0,'chamber-recital.jpg'
);

// Past event for Health
insEvent.run(
  ids.health,
  'Wellness Workshop: Stress Relief Basics',
  'Breathing, posture and mobility for reducing stress.',
  '2025-09-05','18:00','Palas Garden Hub','wellness',0,'health-workshop.jpg'
);

// Past event for Education
insEvent.run(
  ids.education,
  'UAIC Campus Tour & Info Session',
  'Guided tour with Q&A about programmes and admissions.',
  '2025-09-08','16:00','UAIC Main Building, Copou','education',0,'uaic-tour.jpg'
);

// --- FAQS ---
const insFaq = db.prepare('INSERT INTO faqs(question, answer) VALUES (?,?)');
[
  ['How do I submit a community event?', 'Use the Contact form and include title, date, location and a short description. Our team will review and publish it.'],
  ['Is the Opera open-air concert free?', 'Yes — entry is free. Arrive early for a good viewing spot.'],
  ['Are activities suitable for beginners?', 'Absolutely. Jogging, canoe, and pilates sessions welcome all levels.'],
  ['What locations do you usually feature?', 'Central Iași (Palas, Piața Palatului Culturii), Copou, Aroneanu Lake, and UAIC venues.']
].forEach(([q,a]) => insFaq.run(q,a));

console.log('✅ Database seeded → db/iasi.db with future + past events');