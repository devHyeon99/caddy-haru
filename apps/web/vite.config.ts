import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// ADR-0009: vanilla-extract는 빌드 때 CSS로 추출된다(런타임 0)
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    // 로컬 개발: /api는 NestJS(3000)로 — 운영에서는 Worker 프록시(worker/index.ts)가 같은 역할 (architecture §5.1)
    // NestJS는 X-Proxy-Secret이 없으면 403이므로 apps/api/.env의 PROXY_SECRET과 같은 값을 붙인다 (T-E11)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        headers: { 'x-proxy-secret': process.env.PROXY_SECRET ?? 'dev-proxy-secret' },
      },
    },
  },
  build: {
    target: 'es2022',
  },
});
