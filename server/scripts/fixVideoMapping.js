/*
  Fix video entries in migration-output.json to use versioned, working Cloudinary URLs.
  - Reads server/scripts/migration-output.json
  - For each entry with resourceType==='video', calls Admin API to get version/format
  - Writes back updated url and posterUrl with /v<version>/ path
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { v2: cloudinary } = require('cloudinary');

const OUTPUT = path.join(__dirname, 'migration-output.json');

async function main() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary env.');
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  if (!fs.existsSync(OUTPUT)) {
    console.error('Not found:', OUTPUT);
    process.exit(1);
  }
  const map = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  let changed = 0;

  const entries = Object.entries(map);
  for (const [rel, info] of entries) {
    if (!info || info.resourceType !== 'video') continue;
    const publicId = info.publicId;
    try {
      const res = await cloudinary.api.resource(publicId, { resource_type: 'video', type: 'upload' });
      const v = res.version ? `v${res.version}` : undefined;
      const fmt = res.format || 'mp4';
      const url = cloudinary.url(publicId, { resource_type: 'video', secure: true, version: v, format: fmt });
      const posterUrl = cloudinary.url(publicId + '.jpg', { resource_type: 'video', secure: true, version: v });
      if (info.url !== url || info.posterUrl !== posterUrl) {
        info.url = url;
        info.posterUrl = posterUrl;
        changed++;
        console.log('Fixed:', rel, '->', url);
      }
    } catch (e) {
      console.warn('Lookup failed for', publicId, e.message);
    }
  }

  if (changed > 0) {
    fs.writeFileSync(OUTPUT, JSON.stringify(map, null, 2));
    console.log('Updated mapping saved to', OUTPUT, '(changed', changed, 'videos)');
  } else {
    console.log('No video entries needed changes.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });
