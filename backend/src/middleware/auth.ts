import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../models/User';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'No autorizado - Token no proporcionado'
    });
    return;
  }

  // 🔍 LOG: Verificar configuración JWT
  console.log('🔑 JWT_SECRET:', process.env['JWT_SECRET']);
  console.log('⏳ JWT_EXPIRES_IN:', process.env['JWT_EXPIRES_IN']);
  console.log('🪪 Token recibido:', token);

  try {
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback_secret') as JwtPayload & { id: string };
    
    // 🔍 LOG: Token decodificado
    console.log(' Token decodificado:', decoded);
    console.log('🆔 ID del usuario:', decoded.id);
    
    // Importar el modelo User
    const { User } = await import('../models/User');
    const user = await User.findById(decoded.id);
    
    // 🔍 LOG: Usuario encontrado
    console.log(' Usuario encontrado:', user);
    console.log('🔒 Usuario activo:', user?.isActive);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'No autorizado - Usuario no encontrado'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'No autorizado - Usuario inactivo'
      });
      return;
    }

    // En desarrollo, eliminar password del objeto antes de asignarlo
    if (process.env['NODE_ENV'] === 'development') {
      const { password, ...userWithoutPassword } = user;
      req.user = userWithoutPassword as IUser;
    } else {
      req.user = user;
    }
    next();
  } catch (error) {
    // 🔍 LOG: Error al verificar token
    console.error('❌ Error al verificar token:', error);
    res.status(401).json({
      success: false,
      error: 'No autorizado - Token inválido'
    });
  }
};

export const generateToken = (userId: string): string => {
  // LOG: Configuración al generar token
  console.log('🔑 JWT_SECRET al generar:', process.env['JWT_SECRET']);
  console.log('⏳ JWT_EXPIRES_IN al generar:', process.env['JWT_EXPIRES_IN']);
  
  const payload = { id: userId };
  const secret = process.env['JWT_SECRET'] || 'fallback_secret';
  const options = { expiresIn: process.env['JWT_EXPIRES_IN'] || '7d' };
  
  const token = jwt.sign(payload, secret, options as any);
  
  // 🔍 LOG: Token generado
  console.log('🎫 Token generado:', token);
  
  return token;
}; 