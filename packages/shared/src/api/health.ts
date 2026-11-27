// A1 GET /api/health 응답 — api-spec.md A1, NFR-002
export interface HealthResponse {
  status: 'ok';
  /** 배포된 커밋 SHA(짧은 형식). 로컬은 "dev" */
  version: string;
  uptimeSec: number;
}
