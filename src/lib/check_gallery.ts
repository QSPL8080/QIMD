import { db } from './db';
import { galleryData } from '../data';

async function syncAndCheckGallery() {
  console.log(`Starting gallery sync for ${galleryData.length} items...`);

  for (let i = 0; i < galleryData.length; i++) {
    const item = galleryData[i];
    const fileUrl = item.src;

    const existing = await db.gallery.findFirst({
      where: { fileUrl },
    });

    if (existing) {
      await db.gallery.update({
        where: { id: existing.id },
        data: {
          category: item.category,
          album: item.category,
          altText: item.alt,
          caption: item.caption,
          displayOrder: i + 1,
          isDeleted: false,
        },
      });
    } else {
      await db.gallery.create({
        data: {
          category: item.category,
          album: item.category,
          mediaType: 'IMAGE',
          fileUrl: item.src,
          thumbnail: item.src,
          altText: item.alt,
          caption: item.caption,
          displayOrder: i + 1,
          isDeleted: false,
        },
      });
    }
  }

  const records = await db.gallery.findMany({
    where: { isDeleted: false },
    orderBy: { displayOrder: 'asc' },
  });
  console.log('--- GALLERY DB ACTIVE RECORDS COUNT ---', records.length);
  
  const categoryCounts: Record<string, number> = {};
  records.forEach((r) => {
    const cat = r.category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  console.log('--- CATEGORY BREAKDOWN ---', categoryCounts);
}

syncAndCheckGallery()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error in sync:', err);
    process.exit(1);
  });

