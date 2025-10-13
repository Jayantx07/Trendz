/*
  Migration script: Upload all files from client/public to Cloudinary.
  - Uses env CLOUDINARY_* from server/.env
  - Stores under folder `site-assets` by default
  - Outputs a JSON mapping file at server/scripts/migration-output.json
  - Skips HTML and favicon manifest files by default; adjust includeExts to control
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { v2: cloudinary } = require('cloudinary');

const ROOT = path.join(__dirname, '..', '..');
const PUBLIC_DIR = path.join(ROOT, 'client', 'public');
const OUTPUT = path.join(__dirname, 'migration-output.json');
const FOLDER = process.env.CLOUDINARY_MIGRATION_FOLDER || 'site-assets';

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

async function uploadFile(absPath, relKey) {
  const ext = path.extname(absPath).toLowerCase();
  const isVideo = ['.mp4', '.mov', '.webm'].includes(ext);
  const resource_type = isVideo ? 'video' : 'image';
  // sanitize: normalize path separators, drop extension, trim whitespace
  const cleanRel = relKey
    .replace(/\\/g,'/')
    .replace(/\.[^/.]+$/, '')
    .trim()
    .replace(/\s+/g, '_'); // avoid spaces in public_id
  const public_id = `${FOLDER}/${cleanRel}`;

  if (isVideo) {
    const stats = fs.statSync(absPath);
    const isLarge = stats.size > 90 * 1024 * 1024; // >90MB use chunked
    let res;
    if (isLarge) {
      const options = {
        resource_type: 'auto',
        public_id, // enforce sanitized id
        overwrite: true,
        chunk_size: 6_000_000, // ~6MB chunks
        eager: [{ format: 'mp4', streaming_profile: 'auto' }],
        eager_async: true,
      };
      res = await cloudinary.uploader.upload_large(absPath, options);
    } else {
      const options = {
        resource_type: 'auto',
        public_id,
        overwrite: true,
      };
      res = await cloudinary.uploader.upload(absPath, options);
    }
    let finalPublicId = (res && res.public_id) || public_id;
    let version = res && res.version;
    let format = (res && res.format) || ext.replace('.', '') || 'mp4';
    let secureUrl = res && res.secure_url;
    const detectedType = res && res.resource_type;
    if (detectedType && detectedType !== 'video') {
      console.warn('Cloudinary detected non-video type for a .mp4/.mov/.webm file:', { relKey, detectedType, finalPublicId });
    }

    // If critical fields missing, wait briefly and fetch resource details with retry window
    if (!secureUrl || !version) {
      await new Promise(r => setTimeout(r, 1500));
      const maxRetries = 12;
      for (let i = 0; i < maxRetries; i++) {
        try {
          const info = await cloudinary.api.resource(finalPublicId, { resource_type: 'video', type: 'upload' });
          version = info.version || version;
          format = info.format || format;
          secureUrl = info.secure_url || secureUrl;
          if (secureUrl && version) break;
        } catch (e) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }

    // Fallback to search API if still unresolved
    if (!secureUrl || !version) {
      try {
        const s = await cloudinary.search
          .expression(`resource_type:video AND public_id:"${finalPublicId}"`)
          .max_results(1)
          .execute();
        if (s.resources && s.resources[0]) {
          const r = s.resources[0];
          version = r.version || version;
          format = r.format || format;
          secureUrl = r.secure_url || secureUrl;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!secureUrl && !version) {
      console.error('Could not resolve uploaded video on Cloudinary:', { finalPublicId, relKey });
      return { url: null, publicId: finalPublicId, resourceType: 'video', posterUrl: null };
    }

    const deliveryUrl = cloudinary.url(finalPublicId, { resource_type: 'video', secure: true, version: version, format });
    const posterUrl = cloudinary.url(finalPublicId + '.jpg', { resource_type: 'video', secure: true, version: version });
    return { url: deliveryUrl, publicId: finalPublicId, resourceType: 'video', posterUrl };
  }

  // Images: normal upload with auto quality/format is fine
  const options = {
    resource_type: 'image',
    public_id,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  };
  const res = await cloudinary.uploader.upload(absPath, options);
  return { url: res.secure_url, publicId: res.public_id, resourceType: res.resource_type };
}

async function main() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('Missing Cloudinary env. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('Public directory not found:', PUBLIC_DIR);
    process.exit(1);
  }

  const includeExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov', '.ico']);
  const files = walk(PUBLIC_DIR).filter(f => includeExts.has(path.extname(f).toLowerCase()));
  const map = {};
  for (const f of files) {
    const rel = path.relative(PUBLIC_DIR, f);
    try {
      const uploaded = await uploadFile(f, rel);
      map[rel.replace(/\\/g,'/')] = uploaded;
      console.log('Uploaded:', rel, '->', uploaded.url);
    } catch (e) {
      console.error('Failed:', rel, e.message);
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(map, null, 2));
  console.log('Migration complete. Output at', OUTPUT);
}

main().catch(err => { console.error(err); process.exit(1); });
