/**
 * Cross-browser game event relay via local dev server.
 * Bridges Chrome, Brave, Edge, and any browser profile in real time.
 */

export async function broadcastTableEvent(tableId: string, event: any) {
  try {
    await fetch("/api/table/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId, event }),
    });
  } catch {}
}

export async function pollTableEvents(
  tableId: string,
  since: number,
): Promise<Array<{ id: number; data: any }>> {
  try {
    const res = await fetch(
      `/api/table/events?tableId=${encodeURIComponent(tableId)}&since=${since}`,
    );
    if (res.ok) {
      const json = await res.json();
      return json.events || [];
    }
  } catch {}
  return [];
}
