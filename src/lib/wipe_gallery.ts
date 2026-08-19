import { db } from './db';

async function clearAllGallery() {
  const result = await db.gallery.deleteMany({});
  console.log('--- PERMANENTLY DELETED GALLERY RECORDS FROM DB ---', result.count);
}

clearAllGallery();
