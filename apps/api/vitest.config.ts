import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS 데코레이터 메타데이터(emitDecoratorMetadata)는 esbuild가 만들지 못하므로 SWC로 변환한다 (ADR-0010)
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts', 'test/**/*.int-spec.ts'],
    environment: 'node',
    // 통합·E2E 테스트는 DB 하나를 같이 쓰므로 파일을 차례로 실행한다 (test-plan §1)
    globalSetup: ['test/support/global-setup.ts'],
    fileParallelism: false,
  },
});
