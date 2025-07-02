import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../types';

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log do erro
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Erro operacional (esperado)
  if (error.isOperational) {
    const response: ApiResponse = {
      success: false,
      error: error.message
    };
    res.status(error.statusCode || 500).json(response);
    return;
  }

  // Erros específicos do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const response: ApiResponse = {
      success: false,
      error: 'Erro de banco de dados'
    };
    res.status(400).json(response);
    return;
  }

  // Erros de validação
  if (error.name === 'ValidationError') {
    const response: ApiResponse = {
      success: false,
      error: 'Dados de entrada inválidos'
    };
    res.status(400).json(response);
    return;
  }

  // Erro JWT
  if (error.name === 'JsonWebTokenError') {
    const response: ApiResponse = {
      success: false,
      error: 'Token inválido'
    };
    res.status(401).json(response);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      success: false,
      error: 'Token expirado'
    };
    res.status(401).json(response);
    return;
  }

  // Erro genérico (não esperado)
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message
  };
  
  res.status(500).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    error: `Rota ${req.method} ${req.path} não encontrada`
  };
  res.status(404).json(response);
};

export const createAppError = (
  message: string,
  statusCode: number = 500,
  isOperational: boolean = true
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};