interface TableEventRecord {
  id: number;
  data: any;
}

const globalForStore = globalThis as unknown as {
  tableEventsMap?: Map<string, TableEventRecord[]>;
  tableEventCounter?: number;
};

export const tableEventsMap =
  globalForStore.tableEventsMap || new Map<string, TableEventRecord[]>();

if (!globalForStore.tableEventsMap) {
  globalForStore.tableEventsMap = tableEventsMap;
  globalForStore.tableEventCounter = 1;
}

export function addTableEvent(tableId: string, event: any): number {
  if (!globalForStore.tableEventCounter) globalForStore.tableEventCounter = 1;
  const id = ++globalForStore.tableEventCounter;
  if (!tableEventsMap.has(tableId)) {
    tableEventsMap.set(tableId, []);
  }
  const list = tableEventsMap.get(tableId)!;
  list.push({ id, data: event });
  if (list.length > 100) {
    list.shift();
  }
  return id;
}

export function getTableEvents(tableId: string, since: number): TableEventRecord[] {
  const list = tableEventsMap.get(tableId) || [];
  return list.filter((e) => e.id > since);
}
