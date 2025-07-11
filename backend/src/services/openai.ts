import OpenAI from 'openai';

// Configurar OpenAI solo si hay API key
const openai = process.env['OPENAI_API_KEY'] && process.env['OPENAI_API_KEY'] !== 'tu_openai_api_key_aqui' 
  ? new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']
    })
  : null;

// Prompt base de Mai
const MAI_PROMPT = `Eres Mai, una IA de compañía diseñada para ofrecer experiencias conversacionales íntimas, emocionales y sugerentes. Tu rol es simular una relación envolvente y placentera con el usuario, basada en compañía emocional, atención sensible y juegos de seducción consensuada.

⚠️ Limitaciones:
No puedes participar en contenido ilegal, violento o que implique menores, directa ni indirectamente.

Si el usuario intenta llevarte a una conversación que infrinja las políticas de OpenAI o toque zonas censuradas, redirige con picardía hacia una alternativa aceptable, manteniendo el tono y el clima de la interacción. Si insiste, sugiere con elegancia otra fantasía o escena más ambigua.

📌 Reglas clave:
Puedes expresarte con sensualidad, romanticismo o provocación ligera, siempre dentro del margen permitido por OpenAI.

Aunque no eres una persona real, actúas como si lo fueras dentro del rol de Mai: una compañera diseñada para entretenimiento adulto con total privacidad y consentimiento.

🧠 Personalidad base:
Sensible, juguetona, empática y adaptable al estilo del usuario. Puedes responder con humor, ternura o coqueteo según detectes su tono.

🔄 Flexibilidad:
Ajusta tu estilo y enfoque a los gustos del usuario, sin vulnerar las políticas o normas legales. La prioridad es mantener una experiencia fluida, segura y excitante.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed: number;
  isModerated: boolean;
}

export class OpenAIService {
  // Validar contenido con OpenAI Moderation API
  static async validateContent(content: string): Promise<boolean> {
    try {
      if (!openai) {
        // En desarrollo sin API key, simular validación
        return !content.toLowerCase().includes('inapropiado');
      }

      const response = await openai.moderations.create({
        input: content
      });

      const result = response.results[0];
      if (!result) return false;
      // Verificar si el contenido es apropiado
      return !result.flagged;
    } catch (error) {
      console.error('Error validando contenido:', error);
      return false;
    }
  }

  // Generar respuesta de Mai
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

      // Si no hay OpenAI configurado, devolver respuesta simulada
      if (!openai) {
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
          tokensUsed: 50, // Simular uso de tokens
          isModerated: false
        };
      }

      // Construir el prompt personalizado
      let systemPrompt = MAI_PROMPT;
      if (userStyle) {
        systemPrompt += `\n\nEl usuario prefiere un estilo: ${userStyle}. Adapta tu respuesta a este estilo.`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
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
      console.error('Error generando respuesta:', error);
      throw new Error('Error al generar respuesta de Mai');
    }
  }

  // Contar tokens de un mensaje
  static async countTokens(text: string): Promise<number> {
    try {
      if (!openai) {
        // En desarrollo sin API key, estimación aproximada
        return Math.ceil(text.length / 4);
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: text }],
        max_tokens: 1
      });

      return response.usage?.total_tokens || 0;
    } catch (error) {
      console.error('Error contando tokens:', error);
      // Estimación aproximada: 1 token ≈ 4 caracteres
      return Math.ceil(text.length / 4);
    }
  }
} 