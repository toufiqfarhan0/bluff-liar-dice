import { NextRequest, NextResponse } from "next/server";
import { addTableEvent } from "@/lib/table-store";

export async function POST(req: NextRequest) {
  try {
    const { tableId, event } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: "Missing tableId" }, { status: 400 });
    }
    const id = addTableEvent(tableId, event);
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid JSON" }, { status: 400 });
  }
}
