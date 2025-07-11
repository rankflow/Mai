import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  totalTokens: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [4000, 'El mensaje no puede exceder 4000 caracteres']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  tokensUsed: {
    type: Number,
    default: 0
  }
});

const chatSchema = new Schema<IChat>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  totalTokens: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Método para agregar mensaje
chatSchema.methods['addMessage'] = function(message: IMessage): void {
  this['messages'].push(message);
  if (message.tokensUsed) {
    this['totalTokens'] += message.tokensUsed;
  }
};

// Método para obtener el último mensaje
chatSchema.methods['getLastMessage'] = function(): IMessage | null {
  const msgs = this['messages'];
  return msgs.length > 0 ? msgs[msgs.length - 1] ?? null : null;
};

// Método para obtener el número total de mensajes
chatSchema.methods['getMessageCount'] = function(): number {
  return this['messages'].length;
};

export const Chat = mongoose.model<IChat>('Chat', chatSchema); 