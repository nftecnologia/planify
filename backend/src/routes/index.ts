import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import expensesRoutes from './expenses';
import revenueRoutes from './revenue';
import taxRoutes from './tax';
import cashflowRoutes from './cashflow';
import dashboardRoutes from './dashboard';

const router = Router();

// Registrar todas as rotas
router.use('/api', healthRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/expenses', expensesRoutes);
router.use('/api/revenue', revenueRoutes);
router.use('/api/tax', taxRoutes);
router.use('/api/cashflow', cashflowRoutes);
router.use('/api/dashboard', dashboardRoutes);

export default router;