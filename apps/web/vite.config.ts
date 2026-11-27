import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// ADR-0009: vanilla-extract는 빌드 때 CSS로 추출된다(런타임 0)
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    // 로컬 개발: /api는 NestJS(3000)로 — 운영에서는 Pages Functions 프록시가 같은 역할 (architecture §5.1)
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    target: 'es2022',
  },
});
