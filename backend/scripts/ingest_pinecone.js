require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ai = require('../services/ai.service');
const vs = require('../services/vectorstore.service');

async function main() {
  const file = path.join( __dirname, '..', '..', 'Database', 'Recipes.json');
  if (!fs.existsSync(file)) {
    console.error('Recipes.json not found at', file);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, 'utf8');
  // Assume CSV-like or JSON; try parse JSON first
  let items;
  try { items = JSON.parse(raw); } catch (e) {
    // fallback: parse CSV by lines
    const lines = raw.split('\n').slice(1).filter(Boolean);
    items = lines.map(l => {
      const cols = l.split(',');
      return { id: cols[0], title: cols[2], description: cols[3] };
    });
  }

  console.log(`Preparing to ingest ${items.length} items`);
  const vectors = [];
  for (const it of items) {
    const text = (it.title || '') + '\n' + (it.description || '') + '\n' + (it.instructions || '');
    try {
      const emb = await ai.getEmbedding(text);
      vectors.push({ id: it.recipe_id || it.id || (Date.now()+Math.random()), values: emb, metadata: { title: it.title, text } });
    } catch (err) {
      console.error('Failed embedding for', it.recipe_id || it.id, err.message);
    }
    // upsert in batches of 50
    if (vectors.length >= 50) {
      await vs.upsert(vectors, process.env.PINECONE_NAMESPACE || 'default');
      console.log('Upserted batch');
      vectors.length = 0;
    }
  }
  if (vectors.length > 0) await vs.upsert(vectors, process.env.PINECONE_NAMESPACE || 'default');
  console.log('Ingest completed');
}

main().catch(err => { console.error(err); process.exit(1); });
