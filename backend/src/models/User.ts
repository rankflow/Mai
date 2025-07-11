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

// Tipo para el mock (no extiende de Document)
interface IMockUser {
  _id: string;
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
  save(): Promise<IMockUser>;
}

// --- MOCK SOLO PARA DESARROLLO ---
const mockUsers: IMockUser[] = [];
const MockUser = {
  findOne: async (query: Record<string, unknown>) => {
    const user = mockUsers.find(u => 
      (query['email'] && u.email === query['email']) ||
      (query['username'] && u.username === query['username']) ||
      (query['$or'] && Array.isArray(query['$or']) && (query['$or'] as any[]).some((q) =>
        (q['email'] && u.email === q['email']) || (q['username'] && u.username === q['username'])
      ))
    );
    return user || null;
  },
  findById: async (id: string) => {
    console.log('🔍 Mock findById - Buscando usuario con ID:', id);
    const user = mockUsers.find(u => u._id === id);
    console.log(' Mock findById - Usuario encontrado:', user ? 'SÍ' : 'NO');
    
    if (user) {
      return {
        ...user,
        select: function(_fields: string) {
          console.log('🧪 Mock select() - Campos a excluir:', _fields);
          // Simular select('-password') devolviendo el objeto sin password
          const { password, ...userWithoutPassword } = this;
          console.log(' Mock select() - Usuario sin password:', userWithoutPassword);
          return userWithoutPassword;
        }
      };
    }
    return null;
  },
  findByIdAndUpdate: async (id: string, update: Partial<IMockUser>) => {
    const user = mockUsers.find(u => u._id === id);
    if (user) {
      Object.assign(user, update);
      return user;
    }
    return null;
  },
  create: async (data: Partial<IMockUser>) => {
    const email = data.email ?? '';
    const username = data.username ?? '';
    const hashedPassword = await bcrypt.hash(data.password ?? '', 12);
    const user: IMockUser = {
      _id: Math.random().toString(36).substr(2, 9),
      email,
      password: hashedPassword,
      username,
      tokens: typeof data.tokens === 'number' ? data.tokens : parseInt(process.env['DEFAULT_TOKENS_PER_USER'] || '1000'),
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      comparePassword: async function(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
      },
      consumeTokens: function(amount: number): boolean {
        if (this.tokens >= amount) {
          this.tokens -= amount;
          return true;
        }
        return false;
      },
      addTokens: function(amount: number): void {
        this.tokens += amount;
      },
      updateLastLogin: function(): void {
        this.lastLogin = new Date();
      },
      save: async function(): Promise<IMockUser> {
        return this;
      }
    };
    mockUsers.push(user);
    return user;
  },
  countDocuments: async () => mockUsers.length
};

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

console.log('🔍 Verificando entorno:', {
  NODE_ENV: process.env['NODE_ENV'],
  isDev: isDev,
  readyState: mongoose.connection.readyState
});

let User: any;

if (isDev) {
  // Log para dejar claro que se usa el mock
  console.log('🟢 Usando MOCK de User en desarrollo');
  User = MockUser;
} else {
  // Exportar el modelo real
  console.log('🔴 Usando modelo real de Mongoose');
  User = (mongoose.models as any).User || mongoose.model<IUser>('User', userSchema);
}

console.log('📦 Modelo User exportado:', typeof User, User ? '✅' : '❌');

export { User }; 