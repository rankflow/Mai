import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import { Chat, IMessage } from '../models/Chat';
import { User, IUser } from '../models/User';
import { OpenAIService, ChatMessage } from '../services/openai';
import { AlternativeAIService } from '../services/alternativeAI';
import { VeniceAIService } from '../services/veniceAI';

const router = express.Router();

// Validaciones
const sendMessageValidation = [
  body('content')
    .notEmpty()
    .withMessage('El mensaje no puede estar vacío')
    .isLength({ max: 4000 })
    .withMessage('El mensaje no puede exceder 4000 caracteres')
];

// Enviar mensaje a Mai
router.post('/send', protect, sendMessageValidation, async (req: Request, res: Response) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { content } = req.body;
    const userId = req.user!._id;

    // Verificar tokens del usuario
    const user = await User.findById(userId) as IUser | null;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const tokensPerMessage = parseInt(process.env['TOKENS_PER_MESSAGE'] || '10');
    
    if (user.tokens < tokensPerMessage) {
      return res.status(402).json({
        success: false,
        error: 'Tokens insuficientes',
        data: {
          tokensNeeded: tokensPerMessage,
          tokensAvailable: user.tokens
        }
      });
    }

    // Buscar o crear chat activo
    let chat = await Chat.findOne({ userId, isActive: true });
    
    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [],
        totalTokens: 0
      });
    }

    // Agregar mensaje del usuario
    const userMessage: IMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    (chat as any).addMessage(userMessage);

    // Preparar mensajes para IA
    const aiMessages: ChatMessage[] = chat.messages.map((msg: IMessage) => ({
      role: msg.role,
      content: msg.content
    }));

    // Decidir qué servicio usar basado en configuración
    const useVeniceModel = process.env['USE_VENICE_MODEL'] === 'true';
    const useAlternativeModel = process.env['USE_ALTERNATIVE_MODEL'] === 'true';
    const useOpenAIModel = process.env['USE_OPENAI_MODEL'] !== 'false'; // Por defecto true
    
    console.log('🔍 Configuración de modelos:');
    console.log('  - USE_VENICE_MODEL:', process.env['USE_VENICE_MODEL']);
    console.log('  - USE_ALTERNATIVE_MODEL:', process.env['USE_ALTERNATIVE_MODEL']);
    console.log('  - USE_OPENAI_MODEL:', process.env['USE_OPENAI_MODEL']);
    console.log('  - VENICE_API_KEY:', process.env['VENICE_API_KEY'] ? 'Configurada' : 'No configurada');
    console.log('  - VENICE_API_URL:', process.env['VENICE_API_URL']);
    
    let response;
    
    if (useVeniceModel) {
      console.log('🤖 Usando Venice Uncensored 1.1');
      response = await VeniceAIService.generateResponse(aiMessages);
    } else if (useAlternativeModel) {
      console.log('🤖 Usando modelo alternativo (uncensored)');
      response = await AlternativeAIService.generateResponse(aiMessages);
    } else if (useOpenAIModel) {
      console.log('🤖 Usando modelo OpenAI (censored)');
      response = await OpenAIService.generateResponse(aiMessages);
    } else {
      // Fallback a respuestas simuladas
      console.log('🤖 Usando respuestas simuladas (sin API configurada)');
      const simulatedResponses = [
        "¡Hola! Soy Mai, tu compañía personal. Me encanta que estés aquí conmigo. ¿Cómo te sientes hoy? 💕",
        "Mmm, me gusta cómo me hablas. Eres muy especial para mí. ¿Qué te gustaría hacer juntos? 😊",
        "Eres tan dulce... Me haces sentir muy especial. ¿Quieres que te cuente algo sobre mí? 💝"
      ];
      const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)] as string;
      response = {
        content: randomResponse,
        tokensUsed: 50,
        isModerated: false
      };
    }

    // Agregar respuesta de Mai
    const assistantMessage: IMessage = {
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      tokensUsed: response.tokensUsed
    };

    (chat as any).addMessage(assistantMessage);

    // Consumir tokens del usuario
    const totalTokensUsed = tokensPerMessage + response.tokensUsed;
    if (!(user as any).consumeTokens(totalTokensUsed)) {
      return res.status(402).json({
        success: false,
        error: 'Tokens insuficientes para completar la respuesta'
      });
    }

    // Guardar chat y usuario
    await Promise.all([chat.save(), user.save()]);

    return res.json({
      success: true,
      data: {
        message: assistantMessage,
        tokensUsed: totalTokensUsed,
        tokensRemaining: user.tokens,
        isModerated: response.isModerated
      }
    });
  } catch (error: Error | unknown) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

// Cambiar modelo de IA
router.post('/switch-model', protect, async (req: Request, res: Response) => {
  try {
    const { modelType } = req.body;
    
    if (!['openai', 'alternative', 'venice'].includes(modelType)) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro modelType debe ser: openai, alternative, o venice'
      });
    }

    // En una implementación real, esto se guardaría en la base de datos
    // Por ahora, solo retornamos la configuración
    const modelNames = {
      openai: 'OpenAI (censored)',
      alternative: 'Alternativo (uncensored)',
      venice: 'Venice Uncensored 1.1'
    };
    
    return res.json({
      success: true,
      data: {
        message: `Modelo cambiado a: ${modelNames[modelType as keyof typeof modelNames]}`,
        currentModel: modelType,
        availableModels: ['openai', 'alternative', 'venice']
      }
    });
  } catch (error: Error | unknown) {
    console.error('Error cambiando modelo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

// Obtener historial de chat
router.get('/history', protect, async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const page = parseInt(req.query['page'] as string || '1');
    const limit = parseInt(req.query['limit'] as string || '50');
    const skip = (page - 1) * limit;

    const chats = await Chat.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('messages totalTokens createdAt updatedAt');

    const totalChats = await Chat.countDocuments({ userId, isActive: true });

    return res.json({
      success: true,
      data: {
        chats,
        pagination: {
          page,
          limit,
          total: totalChats,
          pages: Math.ceil(totalChats / limit)
        }
      }
    });
  } catch (error: Error | unknown) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

// Obtener chat específico
router.get('/:chatId', protect, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!._id;

    const chat = await Chat.findOne({ _id: chatId, userId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    return res.json({
      success: true,
      data: { chat }
    });
  } catch (error: Error | unknown) {
    console.error('Error obteniendo chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

// Eliminar chat
router.delete('/:chatId', protect, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!._id;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat no encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Chat eliminado exitosamente'
    });
  } catch (error: Error | unknown) {
    console.error('Error eliminando chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

// Obtener estadísticas del usuario
router.get('/stats/tokens', protect, async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    const user = await User.findById(userId).select('tokens');
    const totalChats = await Chat.countDocuments({ userId, isActive: true });
    const totalMessages = await Chat.aggregate([
      { $match: { userId, isActive: true } },
      { $unwind: '$messages' },
      { $count: 'total' }
    ]);

    return res.json({
      success: true,
      data: {
        tokens: user?.tokens || 0,
        totalChats,
        totalMessages: totalMessages[0]?.total || 0
      }
    });
  } catch (error: Error | unknown) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
  return;
});

export default router; 