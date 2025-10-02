import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getEnv } from '../utils/env';
import { requireAuth } from '../middleware/auth';

const env = getEnv();
const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(60),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  const { email, name, password } = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });
  res.json({ id: user.id, email: user.email, name: user.name });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ id: user.id, email: user.email, name: user.name, token });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true } });
  res.json(me);
});

export default router;


