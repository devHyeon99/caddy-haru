import type { AuthUser } from './user-id.js';

declare global {
  namespace Express {
    interface Request {
      /** RequestIdMiddleware가 붙이는 요청 ID (api-spec §1.3) */
      requestId?: string;
      /** SessionGuard가 붙이는 사용자 (NFR-003) */
      user?: AuthUser;
    }
  }
}

export {};
