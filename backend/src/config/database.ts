import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/mai';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Conectado a MongoDB');
    
    // Configurar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de conexión a MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Desconectado de MongoDB');
    });
    
    // Manejar cierre graceful
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión a MongoDB cerrada');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    
    // En desarrollo, permitir que el servidor continúe sin MongoDB
    if (process.env['NODE_ENV'] === 'development') {
      console.log('⚠️ Continuando sin MongoDB en modo desarrollo');
      console.log('📝 Usando almacenamiento en memoria para desarrollo');
      return;
    }
    
    process.exit(1);
  }
}; 