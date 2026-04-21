import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadsDir = path.resolve(__dirname, '../../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const userId = (req as any).user?.userId ?? 'anon';
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${userId}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (ALLOWED.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo não suportado. Use JPG, PNG, WEBP ou GIF.'));
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

export const UPLOADS_ROOT = uploadsDir;
