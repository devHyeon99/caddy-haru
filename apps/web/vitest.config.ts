import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    // 화면 컴포넌트 테스트(T-W04·05·08·09)를 위해 jsdom
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
  },
});
