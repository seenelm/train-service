import { Router } from 'express';

const router = Router();

// User routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get user with id ${req.params.id}` });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create new user' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update user with id ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete user with id ${req.params.id}` });
});

export default router; 