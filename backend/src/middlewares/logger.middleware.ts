import morgan from 'morgan';
import { createWriteStream } from 'fs';
import path from 'path';
import { env } from '../config/env';

const accessLogStream = createWriteStream(
  path.resolve(__dirname, '../../../logs/access.log'),
  { flags: 'a' },
);

export const loggerMiddleware = env.NODE_ENV === 'production'
  ? morgan('combined', { stream: accessLogStream })
  : morgan('dev');
