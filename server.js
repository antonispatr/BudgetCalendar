const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
app.use(express.json());
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS = path.join(DATA_DIR, 'events.json');
const INCOME = path.join(DATA_DIR, 'income.json');

// Ensure files exist
async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (let file of [EVENTS, INCOME]) {
    try { await fs.access(file) }
    catch { await fs.writeFile(file, '[]') }
  }
}
ensureFiles();

// CORS + static
app.use(express.static(path.join(__dirname)));
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  next();
});

// Helpers
async function readJSON(fp) { 
  return JSON.parse(await fs.readFile(fp, 'utf8'));
}
async function writeJSON(fp, data) {
  await fs.writeFile(fp, JSON.stringify(data, null,2));
}

// Events API
app.get('/api/events',   async (req,res) => res.json(await readJSON(EVENTS)));
app.post('/api/events',  async (req,res) => {
  let evts = await readJSON(EVENTS);
  evts.push(...req.body);
  await writeJSON(EVENTS, evts);
  res.json(evts);
});

// Income API
app.get('/api/income',   async (req,res) => res.json(await readJSON(INCOME)));
app.post('/api/income',  async (req,res) => {
  let inc = await readJSON(INCOME);
  inc.push(req.body);
  await writeJSON(INCOME, inc);
  res.json(inc);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
