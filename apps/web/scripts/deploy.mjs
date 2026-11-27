// Workers Builds 배포 명령 — architecture §8.2, ADR-0002(개정)
// main 브랜치만 프로덕션 배포(wrangler deploy). 다른 브랜치(PR)는 미리보기 버전만 올린다(wrangler versions upload).
// 대시보드의 비프로덕션 설정과 관계없이 PR이 프로덕션에 나가지 않게 한다.
// WORKERS_CI_BRANCH: Workers Builds가 넣어 주는 브랜치 이름. 로컬에서는 비어 있으므로 --production을 줘야 배포한다.
import { spawnSync } from 'node:child_process';

const PRODUCTION_BRANCH = 'main';
const branch = process.env.WORKERS_CI_BRANCH;
const isProduction = branch ? branch === PRODUCTION_BRANCH : process.argv.includes('--production');

const args = isProduction ? ['deploy'] : ['versions', 'upload'];
console.log(`[deploy] branch=${branch ?? '(로컬)'} → wrangler ${args.join(' ')}`);
if (process.argv.includes('--dry-run')) process.exit(0);

const result = spawnSync('wrangler', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
