import { NextRequest } from 'next/server';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function OPTIONS() { return corsOptions(); }

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File | null;

  if (!file) {
    return json({ error: 'No image file provided' }, 400);
  }

  if (file.size > MAX_SIZE) {
    return json({ error: 'File too large. Maximum 5MB allowed.' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ error: 'Invalid file type. Only JPEG, PNG, GIF, WEBP allowed.' }, 400);
  }

  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const ext = EXT_MAP[file.type] || 'jpg';
  const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  // Build the URL based on the request origin
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  const imageUrl = `${origin}/uploads/${filename}`;

  return json({
    success: true,
    url: imageUrl,
    filename,
  });
}
