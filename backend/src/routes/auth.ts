import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';
import { AuthenticatedRequest, ApiResponse } from '../types';

const router = Router();
const authService = new AuthService();

// Validações
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('companyName').optional().trim(),
  body('cnpj').optional().matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).withMessage('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

// POST /api/auth/register
router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, companyName, cnpj } = req.body;

    const result = await authService.register({
      email,
      password,
      name,
      companyName,
      cnpj
    });

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };

    res.status(400).json(response);
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, validateRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      }
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };

    res.status(401).json(response);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: ApiResponse = {
        success: false,
        error: 'Refresh token é obrigatório'
      };
      res.status(400).json(response);
      return;
    }

    const tokens = await authService.refreshTokens(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Refresh token inválido'
    };

    res.status(401).json(response);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      res.status(401).json(response);
      return;
    }

    const user = await authService.getUserProfile(req.user.id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não encontrado'
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: { user }
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };

    res.status(500).json(response);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'Usuário não autenticado'
      };
      res.status(401).json(response);
      return;
    }

    const { name, companyName, cnpj } = req.body;

    const updatedUser = await authService.updateProfile(req.user.id, {
      name,
      companyName,
      cnpj
    });

    const response: ApiResponse = {
      success: true,
      data: { user: updatedUser }
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    };

    res.status(500).json(response);
  }
});

// PUT /api/auth/change-password
router.put('/change-password', 
  authenticateToken, 
  changePasswordValidation, 
  validateRequest, 
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Usuário não autenticado'
        };
        res.status(401).json(response);
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Senha alterada com sucesso' }
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      };

      res.status(400).json(response);
    }
  }
);

export default router;