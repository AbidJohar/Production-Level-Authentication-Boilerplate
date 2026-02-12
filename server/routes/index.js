import { Router } from 'express';
import authRoutes from './auth.router.js';
import userRoutes from './user.router.js';


const router = Router();


// ______________( API endpoints )______________

router.get('/', (req, res) => res.json({ ok: true, message: 'API is running' }));
router.use('/auth', authRoutes);
router.use("/user", userRoutes);



export default router;