import helmet from 'helmet';
import hpp from 'hpp';
import { xss } from 'express-xss-sanitizer';
import { Application } from 'express';

export function applySecurityMiddleware(app: Application): void {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  app.use(hpp());

  app.use(
    xss({
      allowedKeys: ['crm_note', 'description'],
    })
  );
}