import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // You can process/store the data here (e.g., save to DB, send email, etc.)
  // For now, just return the received data
  return NextResponse.json(
    { message: "Data received", data: body },
    { status: 200 }
  );
}
