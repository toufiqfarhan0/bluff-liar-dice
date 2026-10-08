import { NextRequest, NextResponse } from "next/server";
import { getTableEvents } from "@/lib/table-store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId") || "";
    const since = Number(searchParams.get("since") || "0");

    const events = getTableEvents(tableId, since);
    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
  }
}
