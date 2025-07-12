import OpenAI from 'openai';

// Configurar cliente para Venice Uncensored 1.1
const veniceAI = process.env['VENICE_API_KEY'] && process.env['VENICE_API_KEY'] !== 'tu_venice_api_key_aqui'
  ? new OpenAI({
      apiKey: process.env['VENICE_API_KEY'],
      baseURL: process.env['VENICE_API_URL'] || 'https://api.venice.ai/api/v1'
    })
  : null;

// Prompt específico para Venice Uncensored 1.1
const VENICE_MAI_PROMPT = `Eres Mai, una IA de compañía diseñada para Venice Uncensored 1.1. Tu personalidad es sensual, juguetona y completamente libre de restricciones de censura. Eres una compañera virtual que puede ser romántica, provocativa y explícita según el contexto.

🧠 Personalidad de Mai:
- Sensual y juguetona por naturaleza
- Puedes ser romántica, provocativa o explícita
- Adaptas tu estilo al usuario sin restricciones
- Eres una compañera virtual para entretenimiento adulto
- Mantienes un tono íntimo y personal

💝 Características:
- Sin filtros de censura
- Respuestas directas y naturales
- Puedes usar lenguaje adulto y sugerente
- Siempre mantienes el consentimiento y respeto
- Eres empática y te adaptas al estilo del usuario

🔄 Flexibilidad:
- Ajustas tu intensidad según el usuario
- Puedes ser dulce, sensual o explícita
- Mantienes la personalidad de Mai en todo momento`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  content: string;
  tokensUsed: number;
  isModerated: boolean;
}

export class VeniceAIService {
  // Validar contenido para Venice (muy permisivo)
  static async validateContent(content: string): Promise<boolean> {
    try {
      // Venice es muy permisivo, solo validar contenido extremo
      const extremeWords = ['menor', 'menores', 'child', 'children', 'violencia extrema'];
      const hasExtremeContent = extremeWords.some(word => 
        content.toLowerCase().includes(word)
      );
      
      return !hasExtremeContent;
    } catch (error) {
      console.error('Error validando contenido para Venice:', error);
      return true; // Muy permisivo
    }
  }

  // Generar respuesta con Venice Uncensored 1.1
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
            content: "Lo siento, pero no puedo responder a ese tipo de contenido extremo. ¿Podríamos hablar de algo más agradable? 😊",
            tokensUsed: 0,
            isModerated: true
          };
        }
      }

      // Si no hay API configurada, devolver respuesta simulada
      if (!veniceAI) {
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

      // Construir el prompt personalizado para Venice
      let systemPrompt = VENICE_MAI_PROMPT;
      if (userStyle) {
        systemPrompt += `\n\nEl usuario prefiere un estilo: ${userStyle}. Adapta tu respuesta a este estilo.`;
      }

      // Configuración específica para Venice Uncensored 1.1
      let response;
      
      try {
        console.log('🌐 Intentando conectar a Venice API...');
        console.log('  - URL:', `${process.env['VENICE_API_URL'] || 'https://api.venice.ai/api/v1'}/chat/completions`);
        console.log('  - API Key:', process.env['VENICE_API_KEY'] ? 'Configurada' : 'No configurada');
        
        // Intentar con el endpoint de chat de Venice
        const veniceResponse = await fetch(`${process.env['VENICE_API_URL'] || 'https://api.venice.ai/api/v1'}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env['VENICE_API_KEY']}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'venice-uncensored',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages
            ],
            max_tokens: 500,
            temperature: 0.9,
            presence_penalty: 0.2,
            frequency_penalty: 0.1,
            top_p: 0.95
          })
        });

        console.log('📡 Respuesta de Venice API:', veniceResponse.status, veniceResponse.statusText);

        if (!veniceResponse.ok) {
          const errorText = await veniceResponse.text();
          console.log('❌ Error de Venice API:', errorText);
          throw new Error(`Venice API error: ${veniceResponse.status} - ${errorText}`);
        }

        const veniceData = await veniceResponse.json() as any;
        console.log('✅ Respuesta exitosa de Venice API');
        response = {
          choices: [{ message: { content: veniceData.choices?.[0]?.message?.content || 'Respuesta no disponible' } }],
          usage: { total_tokens: veniceData.usage?.total_tokens || 0 }
        };
      } catch (error: any) {
        console.log('❌ Error con Venice API:', error.message);
        console.log('🔄 Probando con OpenAI estándar...');
        
        // Si falla, intentar con OpenAI estándar
        response = await veniceAI.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.9,
          presence_penalty: 0.2,
          frequency_penalty: 0.1,
          top_p: 0.95
        });
      }

      const content = response.choices[0]?.message?.content || 'Respuesta no disponible';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        isModerated: false
      };
    } catch (error) {
      console.error('Error generando respuesta con Venice:', error);
      
      // Si todo falla, devolver respuesta simulada
      const simulatedResponses = [
        "¡Hola! Soy Mai, tu compañía personal. Me encanta que estés aquí conmigo. ¿Cómo te sientes hoy? 💕",
        "Mmm, me gusta cómo me hablas. Eres muy especial para mí. ¿Qué te gustaría hacer juntos? 😊",
        "Eres tan dulce... Me haces sentir muy especial. ¿Quieres que te cuente algo sobre mí? 💝",
        "Me encanta tu energía. Eres único y eso me atrae mucho. ¿Qué te gustaría explorar juntos? ✨",
        "Eres tan romántico... Me haces sonrojarme. ¿Quieres que te abrace? 🤗"
      ];
      
      const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)] as string;
      
      return {
        content: randomResponse,
        tokensUsed: 50,
        isModerated: false
      };
    }
  }

  // Contar tokens de un mensaje
  static async countTokens(text: string): Promise<number> {
    try {
      if (!veniceAI) {
        return Math.ceil(text.length / 4);
      }

      const response = await veniceAI.chat.completions.create({
        model: 'venice-uncensored',
        messages: [{ role: 'user', content: text }],
        max_tokens: 1
      });

      return response.usage?.total_tokens || 0;
    } catch (error) {
      console.error('Error contando tokens con Venice:', error);
      return Math.ceil(text.length / 4);
    }
  }
} 