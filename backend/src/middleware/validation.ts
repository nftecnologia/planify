import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';

// Validação básica de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação básica de senha
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Middleware de validação para registro
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const response: ApiResponse = {
      success: false,
      error: 'Nome deve ter pelo menos 2 caracteres'
    };
    res.status(400).json(response);
    return;
  }

  if (!email || !isValidEmail(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'Email deve ter um formato válido'
    };
    res.status(400).json(response);
    return;
  }

  if (!password || !isValidPassword(password)) {
    const response: ApiResponse = {
      success: false,
      error: 'Senha deve ter pelo menos 8 caracteres'
    };
    res.status(400).json(response);
    return;
  }

  next();
};

// Middleware de validação para login
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;

  if (!email || !isValidEmail(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'Email deve ter um formato válido'
    };
    res.status(400).json(response);
    return;
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Senha é obrigatória'
    };
    res.status(400).json(response);
    return;
  }

  next();
};

// Middleware de validação para criação de produto
export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, price } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const response: ApiResponse = {
      success: false,
      error: 'Nome do produto deve ter pelo menos 2 caracteres'
    };
    res.status(400).json(response);
    return;
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Preço deve ser um número maior que zero'
    };
    res.status(400).json(response);
    return;
  }

  next();
};

// Middleware de validação de paginação
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const page = parseInt((req.query['page'] as string) || '1');
  const limit = parseInt((req.query['limit'] as string) || '10');

  if (page < 1) {
    const response: ApiResponse = {
      success: false,
      error: 'Página deve ser maior que zero'
    };
    res.status(400).json(response);
    return;
  }

  if (limit < 1 || limit > 100) {
    const response: ApiResponse = {
      success: false,
      error: 'Limite deve estar entre 1 e 100'
    };
    res.status(400).json(response);
    return;
  }

  // Adiciona ao request para uso posterior
  req.query['page'] = page.toString();
  req.query['limit'] = limit.toString();

  next();
};

// Middleware genérico para validação express-validator
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Dados inválidos',
      data: errors.array()
    };
    res.status(400).json(response);
    return;
  }
  
  next();
};