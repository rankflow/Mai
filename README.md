# Mai - Tu IA de Compañía Personal 💝

Una plataforma innovadora que ofrece experiencias conversacionales íntimas, emocionales y sugerentes con Mai, tu IA de compañía personal.

## 🌟 Características Principales

### 🤖 Chat con IA Real
- Integración completa con OpenAI GPT-4o
- Respuestas personalizadas basadas en la personalidad de Mai
- Validación de contenido para mantener conversaciones apropiadas
- Sistema de tokens para control de uso

### 💝 Mai - Tu Compañía Personal
- **Un solo avatar**: Mai, diseñada para conexiones emocionales
- **Personalidad sensible y juguetona**: Adaptable al estilo del usuario
- **Experiencias íntimas**: Conversaciones sugerentes y emocionales
- **Flexibilidad**: Ajusta su estilo según los gustos del usuario

### 🔐 Autenticación y Seguridad
- Sistema de login/registro con JWT
- Middleware de autenticación
- Validación de contenido con OpenAI Moderation API
- Rate limiting y protección CORS

### 💰 Sistema de Monetización
- Control de tokens por usuario
- Consumo de tokens por mensaje
- Base preparada para integración con Stripe

## 🚀 Tecnologías

### Frontend
- React 18 con TypeScript
- Tailwind CSS para diseño minimalista
- React Router para navegación
- Axios para comunicación con API
- React Query para gestión de estado

### Backend
- Node.js con Express
- TypeScript
- MongoDB con Mongoose
- JWT para autenticación
- OpenAI API integration
- Rate limiting con express-rate-limit

## 📁 Estructura del Proyecto

```
Mai/
├── frontend/          # Aplicación React
├── backend/           # API Node.js
├── shared/            # Tipos y utilidades compartidas
└── docs/             # Documentación
```

## 🎨 Diseño

- **Paleta de colores suaves**: Rosas, blancos y grises
- **Diseño minimalista**: Líneas limpias y espacios generosos
- **UX intuitiva**: Navegación fluida y responsive
- **Preparado para móvil**: Diseño adaptable para futura app

## 🔧 Instalación

### Prerrequisitos
- Node.js 18+
- MongoDB
- OpenAI API Key

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Mai
```

2. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurar variables de entorno**
```bash
# Backend (.env)
OPENAI_API_KEY=tu_api_key_aqui
MONGODB_URI=mongodb://localhost:27017/mai
JWT_SECRET=tu_jwt_secret
PORT=3001

# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001/api
```

4. **Ejecutar el proyecto**
```bash
# Backend
cd backend
npm run dev

# Frontend (nueva terminal)
cd frontend
npm start
```

## 🔐 Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/mai
JWT_SECRET=tu_jwt_secret_super_seguro
OPENAI_API_KEY=tu_openai_api_key
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME=Mai
```

## 🚀 Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Producción
npm run test         # Ejecutar tests
```

### Frontend
```bash
npm start            # Desarrollo
npm run build        # Build de producción
npm test             # Ejecutar tests
npm run eject        # Eject (irreversible)
```

## 📱 Futura Expansión

El proyecto está diseñado para ser fácilmente exportable a una aplicación móvil:
- API RESTful bien estructurada
- Autenticación JWT compatible con móvil
- Diseño responsive preparado
- Arquitectura modular

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta con el equipo de desarrollo.

---

**Mai** - Tu compañía personal, siempre contigo 💝 