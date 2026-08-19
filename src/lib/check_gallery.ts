import { db } from './db';

async function checkGallery() {
  const records = await db.gallery.findMany();
  console.log('--- GALLERY DB RECORDS COUNT ---', records.length);
  console.log(JSON.stringify(records, null, 2));
}

checkGallery();
