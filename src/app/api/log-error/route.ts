import { NextResponse } from 'next/server';
import fs from 'fs';
export async function POST(req: Request) {
  const text = await req.text();
  fs.writeFileSync('error_report.txt', text + '\n\n', { flag: 'a' });
  console.log('CLIENT ERROR LOGGED:', text);
  return NextResponse.json({ ok: true });
}
