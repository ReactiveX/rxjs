import crypto from 'node:crypto';
import fs from 'node:fs';

export function hashBuffer(algorithm, value) {
  return crypto.createHash(algorithm).update(value).digest('hex');
}

export function gitBlobSha1(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const header = Buffer.from(`blob ${buffer.byteLength}\0`);
  return hashBuffer('sha1', Buffer.concat([header, buffer]));
}

export async function hashFile(filePath, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm);
  const input = fs.createReadStream(filePath);
  for await (const chunk of input) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}
