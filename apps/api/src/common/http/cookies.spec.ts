import { describe, expect, it } from 'vitest';
import { clearCookie, parseCookies, serializeCookie } from './cookies.js';

// ADR-0004 쿠키 속성, api-spec B1~B3
describe('cookies', () => {
  it('Cookie 헤더를 이름별로 읽는다 (공백·따옴표·인코딩·중복은 첫 값)', () => {
    const c = parseCookies('a=1; __Host-sid=abc_-; b="x%20y"; a=2; broken; =v');
    expect(c.get('a')).toBe('1');
    expect(c.get('__Host-sid')).toBe('abc_-');
    expect(c.get('b')).toBe('x y');
    expect(c.size).toBe(3);
    expect(parseCookies(undefined).size).toBe(0);
    expect(parseCookies('x=%E0%A4%A').get('x')).toBe('%E0%A4%A'); // 잘못된 인코딩은 원문
  });

  it('Set-Cookie는 항상 HttpOnly; Secure; SameSite=Lax; Path=/', () => {
    expect(serializeCookie('__Host-sid', 'tok', 2592000)).toBe(
      '__Host-sid=tok; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000',
    );
    expect(clearCookie('__Host-sid')).toBe(
      '__Host-sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    );
  });
});
