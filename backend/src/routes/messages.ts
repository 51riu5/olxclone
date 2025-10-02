import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/conversations', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { select: { id: true, title: true, images: { take: 1 } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(conversations);
});

const startSchema = z.object({ listingId: z.number().int(), sellerId: z.number().int() });

router.post('/start', requireAuth, async (req, res) => {
  const { listingId, sellerId } = startSchema.parse(req.body);
  const buyerId = req.user!.id;
  const convo = await prisma.conversation.upsert({
    where: { listingId_buyerId_sellerId: { listingId, buyerId, sellerId } },
    create: { listingId, buyerId, sellerId },
    update: {}
  });
  res.json(convo);
});

const sendSchema = z.object({ conversationId: z.number().int(), body: z.string().min(1).max(2000) });

router.post('/send', requireAuth, async (req, res) => {
  const { conversationId, body } = sendSchema.parse(req.body);
  const senderId = req.user!.id;
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return res.status(404).json({ error: 'NotFound' });
  if (![convo.buyerId, convo.sellerId].includes(senderId)) return res.status(403).json({ error: 'Forbidden' });
  const msg = await prisma.message.create({ data: { conversationId, senderId, body } });
  res.status(201).json(msg);
});

router.get('/:conversationId/messages', requireAuth, async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return res.status(404).json({ error: 'NotFound' });
  if (![convo.buyerId, convo.sellerId].includes(req.user!.id)) return res.status(403).json({ error: 'Forbidden' });
  const messages = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  res.json(messages);
});

export default router;


