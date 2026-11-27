import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { UserId } from '../user-id.js';

/**
 * 세션에서 나온 사용자 ID — Controller가 userId를 얻는 **유일한** 방법 (NFR-003, ADR-0005 ①).
 * 요청 본문·경로·쿼리에서 userId를 받지 않는다.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): UserId => {
  const req = ctx.switchToHttp().getRequest<Request>();
  if (!req.user) throw new Error('CurrentUser는 @Public() 라우트에서 쓸 수 없습니다');
  return req.user.id;
});
