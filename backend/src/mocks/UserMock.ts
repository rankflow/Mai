import bcrypt from 'bcryptjs';

// Tipo para el mock de usuario
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
  select(fields: string): any;
}

// Mock de usuarios en memoria
const mockUsers: IMockUser[] = [];

// Usuario de desarrollo fijo
const devUser: IMockUser = {
  _id: 'dev-user-id',
  email: 'dev@mai.com',
  password: 'dev1234',
  username: 'dev',
  tokens: 9999,
  isActive: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: async function(candidatePassword: string) { 
    return candidatePassword === 'dev1234'; 
  },
  consumeTokens: function(_amount: number) { 
    return true; 
  },
  addTokens: function(_amount: number) {},
  updateLastLogin: function() {
    this.lastLogin = new Date();
  },
  save: async function() { 
    return this; 
  },
  select: function(_fields: string) {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
};

// Agregar usuario dev al mock
mockUsers.push(devUser);

// Mock del modelo User
export const UserMock = {
  findOne: async (query: Record<string, unknown>) => {
    console.log('🔍 [MOCK] User.findOne - Query:', query);
    const user = mockUsers.find(u => 
      (query['email'] && u.email === query['email']) ||
      (query['username'] && u.username === query['username']) ||
      (query['$or'] && Array.isArray(query['$or']) && (query['$or'] as any[]).some((q) =>
        (q['email'] && u.email === q['email']) || (q['username'] && u.username === q['username'])
      ))
    );
    console.log(' [MOCK] User.findOne - Resultado:', user ? 'ENCONTRADO' : 'NO ENCONTRADO');
    return user || null;
  },
  
  findById: async (id: string) => {
    console.log('🔍 [MOCK] User.findById - ID:', id);
    
    // Siempre devolver el usuario dev para cualquier ID
    console.log(' [MOCK] User.findById - Resultado: DEV USER');
    return devUser;
  },
  
  findByIdAndUpdate: async (id: string, update: Partial<IMockUser>) => {
    console.log('🔍 [MOCK] User.findByIdAndUpdate - ID:', id, 'Update:', update);
    const user = mockUsers.find(u => u._id === id);
    if (user) {
      Object.assign(user, update);
      return user;
    }
    return null;
  },
  
  create: async (data: Partial<IMockUser>) => {
    console.log('🔍 [MOCK] User.create - Data:', data);
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
      },
      select: function(_fields: string) {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
      }
    };
    
    mockUsers.push(user);
    console.log(' [MOCK] User.create - Usuario creado con ID:', user._id);
    return user;
  },
  
  countDocuments: async () => mockUsers.length
};

console.log('🟢 [MOCK] UserMock cargado correctamente'); 