// Workers Builds 배포 명령 — architecture §8.2, ADR-0002(개정)
// main 브랜치만 프로덕션 배포(wrangler deploy). 다른 브랜치(PR)는 Worker Preview로만 올린다(wrangler preview, 브랜치 이름 = Preview 이름).
// versions upload가 아니라 preview인 이유: 이 프로젝트의 Workers Builds는 프리뷰 빌드를 Previews 방식으로 돌려서
// versions upload를 쓰면 "name ... must match the name of your Worker" 오류가 난다(2026-11-27 빌드 로그).
// 대시보드의 비프로덕션 설정과 관계없이 PR이 프로덕션에 나가지 않게 한다.
// WORKERS_CI_BRANCH: Workers Builds가 넣어 주는 브랜치 이름. 로컬에서는 비어 있으므로 --production을 줘야 배포한다.
import { spawnSync } from 'node:child_process';

const PRODUCTION_BRANCH = 'main';
const branch = process.env.WORKERS_CI_BRANCH;
const isProduction = branch ? branch === PRODUCTION_BRANCH : process.argv.includes('--production');

const args = isProduction ? ['deploy'] : ['preview'];
console.log(`[deploy] branch=${branch ?? '(로컬)'} → wrangler ${args.join(' ')}`);
if (process.argv.includes('--dry-run')) process.exit(0);

const result = spawnSync('wrangler', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
