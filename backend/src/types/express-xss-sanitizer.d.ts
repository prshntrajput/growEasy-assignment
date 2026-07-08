declare module 'express-xss-sanitizer' {
  import { RequestHandler } from 'express';

  export function xss(options?: { allowedKeys?: string[] }): RequestHandler;
}
