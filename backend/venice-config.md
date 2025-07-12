# Configuración de Venice Uncensored 1.1

## Variables de entorno necesarias

Crea un archivo `.env` en la carpeta `backend/` con esta configuración:

```env
# Configuración del servidor
NODE_ENV=development
PORT=3001

# Base de datos
MONGODB_URI=mongodb://localhost:27017/mai

# Autenticación
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# OpenAI (modelo principal - censored)
OPENAI_API_KEY=tu_openai_api_key_aqui

# Modelo alternativo (uncensored)
ALTERNATIVE_API_KEY=tu_api_key_alternativo_aqui
ALTERNATIVE_API_URL=https://api.tu-modelo-alternativo.com/v1
ALTERNATIVE_MODEL=tu-modelo-uncensored
USE_ALTERNATIVE_MODEL=false

# Venice Uncensored 1.1
VENICE_API_KEY=tu_venice_api_key_aqui
VENICE_API_URL=https://api.venice.ai/v1
USE_VENICE_MODEL=true

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Tokens por usuario (configuración inicial)
DEFAULT_TOKENS_PER_USER=1000
TOKENS_PER_MESSAGE=10

# Logs
LOG_LEVEL=info
```

## Configuración específica para Venice

### 1. Obtener API Key de Venice
- Regístrate en la plataforma de Venice AI
- Obtén tu API key desde el dashboard
- Reemplaza `tu_venice_api_key_aqui` con tu API key real

### 2. Activar Venice
- Cambia `USE_VENICE_MODEL=true` en el archivo `.env`
- Asegúrate de que `USE_ALTERNATIVE_MODEL=false` y `USE_VENICE_MODEL=true`

### 3. Características de Venice Uncensored 1.1
- **Sin restricciones de censura**: Respuestas completamente libres
- **Lenguaje adulto**: Puede usar lenguaje explícito y sugerente
- **Personalidad sensual**: Mai será más directa y provocativa
- **Validación mínima**: Solo bloquea contenido extremo

### 4. Diferencias con otros modelos

| Modelo | Censura | Intensidad | Lenguaje |
|--------|---------|------------|----------|
| OpenAI | Alta | Conservador | Familiar |
| Alternative | Media | Moderado | Sugerente |
| Venice | Mínima | Explícito | Adulto |

## Uso

1. **Configurar variables**: Edita el archivo `.env` con tu API key de Venice
2. **Activar modelo**: Cambia `USE_VENICE_MODEL=true`
3. **Reiniciar servidor**: `npm run dev` en la carpeta backend
4. **Probar**: Envía mensajes desde el frontend

## Endpoints disponibles

- `POST /api/chat/send` - Enviar mensaje a Mai
- `POST /api/chat/switch-model` - Cambiar entre modelos
- `GET /api/chat/history` - Obtener historial

## Ejemplo de cambio de modelo

```bash
curl -X POST http://localhost:3001/api/chat/switch-model \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token" \
  -d '{"modelType": "venice"}'
```

## Notas importantes

- Venice es un modelo sin censura, usa con responsabilidad
- Las respuestas pueden ser explícitas y directas
- Mantiene validación básica para contenido extremo
- Requiere API key válida de Venice AI 