import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

async function getStatementWithImages(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM statements WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  const statement = rows[0];

  const [imgRows] = await pool.query<RowDataPacket[]>(
    'SELECT image_url FROM statement_images WHERE statement_id = ? ORDER BY sort_order ASC', [id]
  );
  statement.imageUrls = imgRows.map((r: RowDataPacket) => r.image_url);
  return statement;
}

async function getAllStatements(activeOnly: boolean) {
  let sql = 'SELECT * FROM statements';
  if (activeOnly) sql += ' WHERE is_active = 1';
  sql += ' ORDER BY sort_order ASC, id ASC';

  const [statements] = await pool.query<RowDataPacket[]>(sql);
  if (statements.length === 0) return [];

  const ids = statements.map((s: RowDataPacket) => s.id);
  const [imgRows] = await pool.query<RowDataPacket[]>(
    `SELECT statement_id, image_url FROM statement_images WHERE statement_id IN (${ids.map(() => '?').join(',')}) ORDER BY sort_order ASC`,
    ids
  );

  const imageMap: Record<number, string[]> = {};
  for (const row of imgRows) {
    if (!imageMap[row.statement_id]) imageMap[row.statement_id] = [];
    imageMap[row.statement_id].push(row.image_url);
  }

  for (const s of statements) {
    s.imageUrls = imageMap[s.id] || [];
  }
  return statements;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const statement = await getStatementWithImages(Number(id));
    if (!statement) return json({ error: 'Statement not found' }, 404);
    return json(statement);
  }

  const activeOnly = searchParams.get('active_only') === '1';
  return json(await getAllStatements(activeOnly));
}

export async function POST(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO statements (title, description, category, date, is_active, sort_order) VALUES (?, ?, ?, NOW(), ?, ?)',
    [body.title || '', body.description || '', body.category || '', body.isActive ?? body.is_active ?? 1, body.order ?? body.sort_order ?? 0]
  );

  const newId = result.insertId;
  const imageUrls: string[] = body.imageUrls || body.image_urls || [];
  for (let i = 0; i < imageUrls.length; i++) {
    await pool.query('INSERT INTO statement_images (statement_id, image_url, sort_order) VALUES (?, ?, ?)', [newId, imageUrls[i], i]);
  }

  return json(await getStatementWithImages(newId), 201);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  const body = await request.json();

  await pool.query(
    'UPDATE statements SET title = ?, description = ?, category = ?, is_active = ?, sort_order = ? WHERE id = ?',
    [body.title || '', body.description || '', body.category || '', body.isActive ?? body.is_active ?? 1, body.order ?? body.sort_order ?? 0, id]
  );

  await pool.query('DELETE FROM statement_images WHERE statement_id = ?', [id]);
  const imageUrls: string[] = body.imageUrls || body.image_urls || [];
  for (let i = 0; i < imageUrls.length; i++) {
    await pool.query('INSERT INTO statement_images (statement_id, image_url, sort_order) VALUES (?, ?, ?)', [id, imageUrls[i], i]);
  }

  return json(await getStatementWithImages(Number(id)));
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM statements WHERE id = ?', [id]);
  return json({ success: true, message: 'Statement deleted' });
}
