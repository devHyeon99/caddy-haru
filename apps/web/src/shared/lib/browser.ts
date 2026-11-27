// 페이지 이동(전체 새로고침) — 테스트에서 바꿔 끼울 수 있게 한 곳에 둔다
export function redirectTo(url: string) {
  window.location.assign(url);
}
