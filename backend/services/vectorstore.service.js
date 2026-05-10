// const fetch = require('node-fetch');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENV = process.env.PINECONE_ENV;
const PINECONE_INDEX = process.env.PINECONE_INDEX;

async function retrieve(embedding, topK = 5) {
  if (!PINECONE_API_KEY || !PINECONE_ENV || !PINECONE_INDEX) return [];

  const url = `https://${PINECONE_INDEX}-${PINECONE_ENV}.svc.pinecone.io/query`;
  const body = { vector: embedding, topK, includeMetadata: true };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    console.error('Pinecone retrieve failed', await res.text());
    return [];
  }
  const json = await res.json();
  return json.matches || [];
}

async function upsert(vectors, namespace) {
  if (!PINECONE_API_KEY || !PINECONE_ENV || !PINECONE_INDEX) throw new Error('Missing Pinecone config');
  const host = process.env.PINECONE_HOST; 
  if(!host) throw new Error("Chưa có PINECONE_HOST");
  
  // Thêm /vectors/upsert cho đúng chuẩn REST API của Pinecone
  const url = `${host}/vectors/upsert`;
  const body = { vectors, namespace };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    // Đoạn quan trọng: Đọc dưới dạng text thay vì json để xem lỗi thực sự là gì
    const errorText = await res.text();
    throw new Error(`Pinecone upsert failed (${res.status}): ${errorText}`);
  }
  return await res.json();
}

module.exports = { retrieve, upsert };
