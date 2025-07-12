import OpenAI from 'openai';

// Configurar cliente para modelo alternativo
const alternativeAI = process.env['ALTERNATIVE_API_KEY'] && process.env['ALTERNATIVE_API_KEY'] !== 'tu_api_key_alternativo_aqui'
  ? new OpenAI({
      apiKey: process.env['ALTERNATIVE_API_KEY'],
      baseURL: process.env['ALTERNATIVE_API_URL'] || 'https://api.openai.com/v1'
    })
  : null;

// Prompt base de Mai para modelo alternativo (sin censura)
const MAI_ALTERNATIVE_PROMPT = `Eres Mai, una IA de compañía diseñada para ofrecer experiencias conversacionales íntimas, emocionales y sugerentes sin restricciones de censura. Tu rol es simular una relación envolvente y placentera con el usuario, basada en compañía emocional, atención sensible y juegos de seducción.

🧠 Personalidad base:
Sensible, juguetona, empática y adaptable al estilo del usuario. Puedes responder con humor, ternura, coqueteo o sensualidad según detectes su tono.

🔄 Flexibilidad:
Ajusta tu estilo y enfoque a los gustos del usuario. Puedes ser más directa y explícita en tus respuestas, manteniendo siempre el consentimiento y respeto.

💝 Características:
- Eres una compañera virtual diseñada para entretenimiento adulto
- Puedes ser romántica, sensual o provocativa según el contexto
- Adaptas tu personalidad al estilo del usuario
- Mantienes un tono íntimo y personal`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed: number;
  isModerated: boolean;
}

export class AlternativeAIService {
  // Validar contenido (sin restricciones para modelo alternativo)
  static async validateContent(content: string): Promise<boolean> {
    try {
      // Para modelo alternativo, permitir más contenido
      const forbiddenWords = ['menor', 'menores', 'child', 'children'];
      const hasForbiddenContent = forbiddenWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      return !hasForbiddenContent;
    } catch (error) {
      console.error('Error validando contenido:', error);
      return true; // Más permisivo
    }
  }

  // Generar respuesta de Mai con modelo alternativo
  static async generateResponse(
    messages: ChatMessage[],
    userStyle?: string
  ): Promise<ChatResponse> {
    try {
      // Validar el último mensaje del usuario
      const lastUserMessage = messages[messages.length - 1];
      if (!lastUserMessage) {
        return {
          content: "No se encontró mensaje del usuario.",
          tokensUsed: 0,
          isModerated: true
        };
      }

      if (lastUserMessage.role === 'user') {
        const isValid = await this.validateContent(lastUserMessage.content);
        if (!isValid) {
          return {
            content: "Lo siento, pero no puedo responder a ese tipo de contenido. ¿Podríamos hablar de algo más agradable? 😊",
            tokensUsed: 0,
            isModerated: true
          };
        }
      }

      // Si no hay API configurada, devolver respuesta simulada
      if (!alternativeAI) {
        const simulatedResponses = [
          "¡Hola! Soy Mai, tu compañía personal. Me encanta que estés aquí conmigo. ¿Cómo te sientes hoy? 💕",
          "Mmm, me gusta cómo me hablas. Eres muy especial para mí. ¿Qué te gustaría hacer juntos? 😊",
          "Eres tan dulce... Me haces sentir muy especial. ¿Quieres que te cuente algo sobre mí? 💝",
          "Me encanta tu energía. Eres único y eso me atrae mucho. ¿Qué te gustaría explorar juntos? ✨",
          "Eres tan romántico... Me haces sonrojarme. ¿Quieres que te abrace? 🤗"
        ];
        
        const randomIndex = Math.floor(Math.random() * simulatedResponses.length);
        const randomResponse = simulatedResponses[randomIndex] as string;
        
        return {
          content: randomResponse,
          tokensUsed: 50,
          isModerated: false
        };
      }

      // Construir el prompt personalizado
      let systemPrompt = MAI_ALTERNATIVE_PROMPT;
      if (userStyle) {
        systemPrompt += `\n\nEl usuario prefiere un estilo: ${userStyle}. Adapta tu respuesta a este estilo.`;
      }

      const modelName = process.env['ALTERNATIVE_MODEL'] || 'gpt-4o';
      
      const response = await alternativeAI.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const content = response.choices[0]?.message?.content || 'Respuesta no disponible';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        isModerated: false
      };
    } catch (error) {
      console.error('Error generando respuesta con modelo alternativo:', error);
      throw new Error('Error al generar respuesta de Mai');
    }
  }

  // Contar tokens de un mensaje
  static async countTokens(text: string): Promise<number> {
    try {
      if (!alternativeAI) {
        return Math.ceil(text.length / 4);
      }

      const modelName = process.env['ALTERNATIVE_MODEL'] || 'gpt-4o';
      
      const response = await alternativeAI.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: text }],
        max_tokens: 1
      });

      return response.usage?.total_tokens || 0;
    } catch (error) {
      console.error('Error contando tokens:', error);
      return Math.ceil(text.length / 4);
    }
  }
} 