import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS 데코레이터 메타데이터(emitDecoratorMetadata)는 esbuild가 만들지 못하므로 SWC로 변환한다 (ADR-0010)
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    environment: 'node',
  },
});
