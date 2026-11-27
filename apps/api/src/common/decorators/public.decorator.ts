import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'caddyHaru:isPublic';

/**
 * 세션 없이 호출할 수 있는 라우트 (architecture §4.3).
 * SessionGuard는 이 표시를 **DB 조회 전에** 확인한다 → `/api/health`는 DB에 닿지 않는다 (§5.2).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
