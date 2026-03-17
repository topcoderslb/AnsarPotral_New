import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { json, OPTIONS as corsOptions } from '@/lib/cors';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function OPTIONS() { return corsOptions(); }

async function getSectionWithContent(id: number) {
  const [sections] = await pool.query<RowDataPacket[]>('SELECT * FROM about_sections WHERE id = ?', [id]);
  if (sections.length === 0) return null;
  const section = sections[0];

  const [contentRows] = await pool.query<RowDataPacket[]>(
    'SELECT content FROM about_section_content WHERE section_id = ? ORDER BY sort_order ASC', [id]
  );
  section.content = contentRows.map((r: RowDataPacket) => r.content);
  return section;
}

async function getAllSections(activeOnly: boolean) {
  let sql = 'SELECT * FROM about_sections';
  if (activeOnly) sql += ' WHERE is_active = 1';
  sql += ' ORDER BY sort_order ASC, id ASC';

  const [sections] = await pool.query<RowDataPacket[]>(sql);
  if (sections.length === 0) return [];

  const ids = sections.map((s: RowDataPacket) => s.id);
  const [contentRows] = await pool.query<RowDataPacket[]>(
    `SELECT section_id, content FROM about_section_content WHERE section_id IN (${ids.map(() => '?').join(',')}) ORDER BY sort_order ASC`,
    ids
  );

  const contentMap: Record<number, string[]> = {};
  for (const row of contentRows) {
    if (!contentMap[row.section_id]) contentMap[row.section_id] = [];
    contentMap[row.section_id].push(row.content);
  }

  for (const s of sections) {
    s.content = contentMap[s.id] || [];
  }
  return sections;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const section = await getSectionWithContent(Number(id));
    if (!section) return json({ error: 'Section not found' }, 404);
    return json(section);
  }

  const activeOnly = searchParams.get('active_only') === '1';
  return json(await getAllSections(activeOnly));
}

export async function POST(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const body = await request.json();

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO about_sections (title, icon, is_active, sort_order) VALUES (?, ?, ?, ?)',
    [body.title || '', body.icon || '📋', body.isActive ?? body.is_active ?? 1, body.order ?? body.sort_order ?? 0]
  );

  const newId = result.insertId;
  const contentItems: string[] = body.content || [];
  if (contentItems.length > 0) {
    for (let i = 0; i < contentItems.length; i++) {
      await pool.query('INSERT INTO about_section_content (section_id, content, sort_order) VALUES (?, ?, ?)', [newId, contentItems[i], i]);
    }
  }

  return json(await getSectionWithContent(newId), 201);
}

export async function PUT(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  const body = await request.json();

  await pool.query(
    'UPDATE about_sections SET title = ?, icon = ?, is_active = ?, sort_order = ? WHERE id = ?',
    [body.title || '', body.icon || '📋', body.isActive ?? body.is_active ?? 1, body.order ?? body.sort_order ?? 0, id]
  );

  await pool.query('DELETE FROM about_section_content WHERE section_id = ?', [id]);
  const contentItems: string[] = body.content || [];
  if (contentItems.length > 0) {
    for (let i = 0; i < contentItems.length; i++) {
      await pool.query('INSERT INTO about_section_content (section_id, content, sort_order) VALUES (?, ?, ?)', [id, contentItems[i], i]);
    }
  }

  return json(await getSectionWithContent(Number(id)));
}

export async function DELETE(request: NextRequest) {
  try { requireAuth(request); } catch { return json({ error: 'Unauthorized' }, 401); }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return json({ error: 'ID required' }, 400);

  await pool.query('DELETE FROM about_sections WHERE id = ?', [id]);
  return json({ success: true });
}
