// Script de prueba para verificar el mock del modelo User
process.env.NODE_ENV = 'development';

console.log('🧪 Probando mock del modelo User...');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Importar el modelo
const { User } = require('./src/models/User');

console.log('📦 Modelo User importado:', typeof User);

// Probar findById con dev-user-id
User.findById('dev-user-id').then((user) => {
  console.log('🔍 Resultado de findById("dev-user-id"):', user);
  if (user) {
    console.log('✅ Mock funciona correctamente');
    console.log('📋 Datos del usuario:', {
      id: user._id,
      email: user.email,
      username: user.username,
      tokens: user.tokens,
      isActive: user.isActive
    });
  } else {
    console.log('❌ Mock NO funciona - usuario es null');
  }
}).catch((error) => {
  console.error('❌ Error al probar mock:', error);
}); 