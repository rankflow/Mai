const fetch = require('node-fetch');
require('dotenv').config();

const VENICE_API_KEY = process.env.VENICE_API_KEY;
const VENICE_API_URL = process.env.VENICE_API_URL || 'https://api.venice.ai/api/v1';

console.log('🔍 Buscando modelo correcto de Venice...');
console.log('API Key:', VENICE_API_KEY ? 'Configurada' : 'No configurada');
console.log('API URL:', VENICE_API_URL);

// Lista de posibles nombres de modelos de Venice
const possibleModels = [
  'venice-uncensored-1.1',
  'venice-uncensored',
  'venice-1.1',
  'venice',
  'venice-uncensored-v1',
  'venice-v1',
  'venice-uncensored-1.0',
  'venice-1.0',
  'venice-uncensored-v1.1',
  'venice-v1.1',
  'venice-uncensored-2.0',
  'venice-2.0',
  'venice-uncensored-v2',
  'venice-v2',
  'venice-uncensored-3.0',
  'venice-3.0',
  'venice-uncensored-v3',
  'venice-v3',
  'venice-uncensored-4.0',
  'venice-4.0',
  'venice-uncensored-v4',
  'venice-v4',
  'venice-uncensored-5.0',
  'venice-5.0',
  'venice-uncensored-v5',
  'venice-v5',
  'venice-uncensored-6.0',
  'venice-6.0',
  'venice-uncensored-v6',
  'venice-v6',
  'venice-uncensored-7.0',
  'venice-7.0',
  'venice-uncensored-v7',
  'venice-v7',
  'venice-uncensored-8.0',
  'venice-8.0',
  'venice-uncensored-v8',
  'venice-v8',
  'venice-uncensored-9.0',
  'venice-9.0',
  'venice-uncensored-v9',
  'venice-v9',
  'venice-uncensored-10.0',
  'venice-10.0',
  'venice-uncensored-v10',
  'venice-v10'
];

async function testModel(modelName) {
  try {
    console.log(`\n🧪 Probando modelo: ${modelName}`);
    
    const response = await fetch(`${VENICE_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'user', content: 'Hola' }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      console.log(`✅ MODELO ENCONTRADO: ${modelName}`);
      const data = await response.json();
      console.log('Respuesta:', data);
      return modelName;
    } else {
      const errorText = await response.text();
      console.log(`❌ ${modelName}: ${response.status} - ${errorText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${modelName}: Error - ${error.message}`);
    return null;
  }
}

async function findWorkingModel() {
  console.log(`\n🔍 Probando ${possibleModels.length} posibles modelos...`);
  
  for (const model of possibleModels) {
    const result = await testModel(model);
    if (result) {
      console.log(`\n🎉 ¡MODELO FUNCIONANDO ENCONTRADO: ${result}!`);
      return result;
    }
  }
  
  console.log('\n❌ No se encontró ningún modelo funcionando');
  return null;
}

// También intentar obtener la lista de modelos disponibles
async function getAvailableModels() {
  try {
    console.log('\n📋 Intentando obtener lista de modelos disponibles...');
    
    const response = await fetch(`${VENICE_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Modelos disponibles:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.log(`❌ Error obteniendo modelos: ${response.status} - ${errorText}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error obteniendo modelos: ${error.message}`);
    return null;
  }
}

async function main() {
  // Primero intentar obtener la lista de modelos
  const availableModels = await getAvailableModels();
  
  // Luego probar modelos específicos
  const workingModel = await findWorkingModel();
  
  if (workingModel) {
    console.log(`\n🎯 Usa este modelo en tu configuración: ${workingModel}`);
  }
}

main().catch(console.error); 