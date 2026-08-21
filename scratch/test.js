const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const bannerDir = path.join(process.cwd(), 'public', 'images', 'Banner');

console.log('Generating 4 clean banners in:', bannerDir);
