import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Tipo real para Mongoose
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  tokens: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  consumeTokens(amount: number): boolean;
  addTokens(amount: number): void;
  updateLastLogin(): void;
}

// --- MODELO REAL DE MONGOOSE ---

// --- MODELO REAL DE MONGOOSE ---
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [20, 'El nombre de usuario no puede exceder 20 caracteres']
  },
  tokens: {
    type: Number,
    default: parseInt(process.env['DEFAULT_TOKENS_PER_USER'] || '1000'),
    min: [0, 'Los tokens no pueden ser negativos']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this['password']);
};
userSchema.methods['consumeTokens'] = function(amount: number): boolean {
  if (this['tokens'] >= amount) {
    this['tokens'] -= amount;
    return true;
  }
  return false;
};
userSchema.methods['addTokens'] = function(amount: number): void {
  this['tokens'] += amount;
};
userSchema.methods['updateLastLogin'] = function(): void {
  this['lastLogin'] = new Date();
};

// --- EXPORTACIÓN SEGÚN ENTORNO ---
const isDev = process.env['NODE_ENV'] === 'development';

console.log('🔍 Verificando entorno User:', {
  NODE_ENV: process.env['NODE_ENV'],
  isDev: isDev,
  readyState: mongoose.connection.readyState
});

let User: any;

if (isDev) {
  console.log('🟢 Usando MOCK separado de User en desarrollo');
  const { UserMock } = require('../mocks/UserMock');
  User = UserMock;
} else {
  console.log('🔴 Usando modelo real de Mongoose');
  User = (mongoose.models as any).User || mongoose.model<IUser>('User', userSchema);
}

console.log('📦 Modelo User exportado:', typeof User, User ? '✅' : '❌');

export { User }; 