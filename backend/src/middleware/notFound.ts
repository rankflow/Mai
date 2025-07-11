import { Request, Response, NextFunction } from 'express';
 
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  (error as unknown as { statusCode: number }).statusCode = 404;
  next(error);
}; 