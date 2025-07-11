import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Cargar variables de entorno PRIMERO
dotenv.config();

import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { protect } from './middleware/auth';

// Importar rutas
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutos
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging
if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV']
  });
});

// Test endpoint
app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint funcionando',
    jwt_secret: process.env['JWT_SECRET'] ? 'Definido' : 'No definido'
  });
});

// Test endpoint con autenticación
app.get('/api/test-auth', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint con autenticación funcionando',
    user: req.user
  });
});

// Test endpoint para validar token manualmente
app.get('/api/test-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado'
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback_secret');
    return res.json({
      success: true,
      message: 'Token válido',
      decoded: decoded
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      details: error.message
    });
  }
});

// Test endpoint para probar el mock de User
app.get('/api/test-user/:id', async (req, res) => {
  try {
    const { User } = require('./models/User');
    const user = await User.findById(req.params.id);
    return res.json({
      success: true,
      user: user
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Error al buscar usuario',
      details: error.message
    });
  }
});

// Test endpoint que simula el middleware de autenticación
app.get('/api/test-auth-simulated', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado - Token no proporcionado'
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback_secret') as any;
    
    const { User } = require('./models/User');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Usuario no encontrado'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Usuario inactivo'
      });
    }
    
    return res.json({
      success: true,
      message: 'Autenticación exitosa',
      user: user
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'No autorizado - Token inválido',
      details: error.message
    });
  }
});

// Test endpoint de chat sin autenticación
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensaje requerido'
      });
    }
    
    // Simular respuesta de Mai
    const response = {
      success: true,
      message: 'Respuesta de Mai',
      data: {
        response: `¡Hola! Soy Mai, tu compañía personal. Me encanta que me hayas escrito: "${message}". ¿Cómo puedo ayudarte hoy? 💕`,
        tokensUsed: 10
      }
    };
    
    return res.json(response);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Función para iniciar servidor sin esperar MongoDB
const startServerWithoutDB = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Mai iniciado en puerto ${PORT}`);
    console.log(`📱 API disponible en http://localhost:${PORT}/api`);
    console.log(`💝 Mai - Tu compañía personal está lista`);
  });
};

// Iniciar servidor con manejo de errores mejorado
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    startServerWithoutDB();
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    
    // En desarrollo, continuar sin MongoDB
    if (process.env['NODE_ENV'] === 'development') {
      console.log('⚠️ Continuando sin MongoDB en modo desarrollo');
      startServerWithoutDB();
      return;
    }
    
    console.error('❌ Error fatal: No se puede conectar a MongoDB en producción');
    process.exit(1);
  }
};

startServer();

export default app; 