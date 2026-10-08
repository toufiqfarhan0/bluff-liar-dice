import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

function tableRelayPlugin() {
  const tableEvents = new Map<string, Array<{ id: number; data: any }>>();
  let counter = 1;

  return {
    name: 'table-relay',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const urlStr = req.url || '';
        if (urlStr.startsWith('/api/table/event') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            try {
              const { tableId, event } = JSON.parse(body);
              if (tableId) {
                if (!tableEvents.has(tableId)) tableEvents.set(tableId, []);
                const list = tableEvents.get(tableId)!;
                list.push({ id: ++counter, data: event });
                if (list.length > 100) list.shift();
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        if (urlStr.startsWith('/api/table/events') && req.method === 'GET') {
          const parsed = new URL(urlStr, 'http://localhost:5173');
          const tableId = parsed.searchParams.get('tableId') || '';
          const since = Number(parsed.searchParams.get('since') || '0');
          const list = tableEvents.get(tableId) || [];
          const newEvents = list.filter((e) => e.id > since);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ events: newEvents }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), tableRelayPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      buffer: 'buffer/',
    },
  },
  define: {
    'global': 'globalThis',
  },
  server: {
    port: 5173,
    host: true,
  },
});
