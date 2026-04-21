import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: number;
  email: string;
  role: 'customer' | 'admin';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): TokenPayload & JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload & JwtPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token);
  return decoded ? (decoded as TokenPayload) : null;
}
