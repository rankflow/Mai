// Tipo para el mock de mensaje
interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

// Tipo para el mock de chat
interface IMockChat {
  _id: string;
  userId: string;
  messages: IMessage[];
  totalTokens: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addMessage(message: IMessage): void;
  getLastMessage(): IMessage | null;
  getMessageCount(): number;
  save(): Promise<IMockChat>;
}

// Mock de chats en memoria
const mockChats: IMockChat[] = [];

// Constructor para el mock de Chat
function MockChatConstructor(data: Partial<IMockChat>) {
  const chat: IMockChat = {
    _id: Math.random().toString(36).substr(2, 9),
    userId: data.userId || '',
    messages: data.messages || [],
    totalTokens: data.totalTokens || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
    addMessage: function(message: IMessage): void {
      this.messages.push(message);
      if (message.tokensUsed) {
        this.totalTokens += message.tokensUsed;
      }
    },
    getLastMessage: function(): IMessage | null {
      const msgs = this.messages;
      return msgs.length > 0 ? msgs[msgs.length - 1] ?? null : null;
    },
    getMessageCount: function(): number {
      return this.messages.length;
    },
    save: async function(): Promise<IMockChat> {
      mockChats.push(this);
      console.log(' [MOCK] Chat.save - Chat guardado con ID:', this._id);
      return this;
    }
  };
  return chat;
}

// Mock del modelo Chat
export const ChatMock = {
  findOne: async (query: Record<string, unknown>) => {
    console.log('🔍 [MOCK] Chat.findOne - Query:', query);
    const chat = mockChats.find(c => 
      (query['userId'] && c.userId === query['userId']) ||
      (query['isActive'] && c.isActive === query['isActive'])
    );
    console.log(' [MOCK] Chat.findOne - Resultado:', chat ? 'ENCONTRADO' : 'NO ENCONTRADO');
    return chat || null;
  },
  
  findById: async (id: string) => {
    console.log('🔍 [MOCK] Chat.findById - ID:', id);
    const chat = mockChats.find(c => c._id === id);
    console.log(' [MOCK] Chat.findById - Resultado:', chat ? 'ENCONTRADO' : 'NO ENCONTRADO');
    return chat || null;
  },
  
  findByIdAndUpdate: async (id: string, update: Partial<IMockChat>) => {
    console.log('🔍 [MOCK] Chat.findByIdAndUpdate - ID:', id, 'Update:', update);
    const chat = mockChats.find(c => c._id === id);
    if (chat) {
      Object.assign(chat, update);
      return chat;
    }
    return null;
  },
  
  create: async (data: Partial<IMockChat>) => {
    console.log('🔍 [MOCK] Chat.create - Data:', data);
    const chat = MockChatConstructor(data);
    mockChats.push(chat);
    console.log(' [MOCK] Chat.create - Chat creado con ID:', chat._id);
    return chat;
  },
  
  countDocuments: async () => mockChats.length
};

// Hacer que ChatMock sea un constructor
(ChatMock as any).prototype = MockChatConstructor.prototype;

console.log('🟢 [MOCK] ChatMock cargado correctamente'); 