import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

// Current user's favorite listings
router.get('/favorites', requireAuth, async (req, res) => {
  const favs = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    include: { listing: { include: { images: true, category: true, seller: { select: { id: true, name: true } } } } },
    orderBy: { id: 'desc' }
  });
  res.json(favs.map(f => f.listing));
});

// Current user's own listings
router.get('/mine', requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user!.id },
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(listings);
});

const createListingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  price: z.number().int().min(0),
  location: z.string().min(2).max(120),
  categoryId: z.number().int(),
  images: z.array(z.string().url()).max(8)
});

router.get('/', async (req, res) => {
  const { q, categoryId, sellerId, minPrice, maxPrice, sort } = req.query as Record<string, string>;
  const where: any = {};
  if (q) where.title = { contains: q, mode: 'insensitive' };
  if (categoryId) where.categoryId = Number(categoryId);
  if (sellerId) where.sellerId = Number(sellerId);
  if (minPrice) where.price = { ...(where.price || {}), gte: Number(minPrice) };
  if (maxPrice) where.price = { ...(where.price || {}), lte: Number(maxPrice) };

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const listings = await prisma.listing.findMany({
    where,
    include: { images: true, category: true, seller: { select: { id: true, name: true} } },
    orderBy
  });
  res.json(listings);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const listing = await prisma.listing.findUnique({ where: { id }, include: { images: true, category: true, seller: { select: { id: true, name: true } } } });
  if (!listing) return res.status(404).json({ error: 'NotFound' });
  res.json(listing);
});

// Check if current user has favorited this listing
router.get('/:id/favorite', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.favorite.findUnique({ where: { userId_listingId: { userId: req.user!.id, listingId: id } } });
  res.json({ favorited: !!existing });
});

router.post('/', requireAuth, async (req, res) => {
  const data = createListingSchema.parse(req.body);
  const created = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      location: data.location,
      categoryId: data.categoryId,
      sellerId: req.user!.id,
      images: { create: data.images.map((url) => ({ url })) }
    },
    include: { images: true }
  });
  res.status(201).json(created);
});

const updateListingSchema = createListingSchema.partial();

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const updates = updateListingSchema.parse(req.body);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return res.status(404).json({ error: 'NotFound' });
  if (listing.sellerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

  const updated = await prisma.$transaction(async (tx) => {
    const base = await tx.listing.update({
      where: { id },
      data: {
        title: updates.title ?? listing.title,
        description: updates.description ?? listing.description,
        price: updates.price ?? listing.price,
        location: updates.location ?? listing.location,
        categoryId: updates.categoryId ?? listing.categoryId
      }
    });
    if (updates.images) {
      await tx.image.deleteMany({ where: { listingId: id } });
      await tx.image.createMany({ data: updates.images.map((url) => ({ url, listingId: id })) });
    }
    return tx.listing.findUnique({ where: { id }, include: { images: true } });
  });

  res.json(updated);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return res.status(404).json({ error: 'NotFound' });
  if (listing.sellerId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.listing.delete({ where: { id } });
  res.json({ ok: true });
});

router.post('/:id/favorite', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.favorite.create({ data: { listingId: id, userId: req.user!.id } });
  res.json({ ok: true });
});

router.delete('/:id/favorite', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.favorite.delete({ where: { userId_listingId: { userId: req.user!.id, listingId: id } } });
  res.json({ ok: true });
});

export default router;


