import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  const KIE_API_KEY = process.env.KIE_API_KEY!;
  const results: Record<string, unknown> = { taskId };

  // Endpoint 1: recordInfo
  try {
    const r1 = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );
    const text1 = await r1.text();
    results.recordInfo = { httpStatus: r1.status, body: tryJson(text1) };
  } catch (e) {
    results.recordInfo = { error: String(e) };
  }

  // Endpoint 2: getTaskDetail
  try {
    const r2 = await fetch(
      `https://api.kie.ai/api/v1/jobs/getTaskDetail?taskId=${encodeURIComponent(taskId)}`,
      { headers: { 'Authorization': `Bearer ${KIE_API_KEY}` } }
    );
    const text2 = await r2.text();
    results.getTaskDetail = { httpStatus: r2.status, body: tryJson(text2) };
  } catch (e) {
    results.getTaskDetail = { error: String(e) };
  }

  return NextResponse.json(results);
}

function tryJson(text: string) {
  try { return JSON.parse(text); } catch { return text; }
}
