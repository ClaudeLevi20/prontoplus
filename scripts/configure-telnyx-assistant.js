#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Script to create Telnyx AI Assistant via API
 * Uses credentials from Railway environment or mcp.json
 */

const API_KEY = process.env.TELNYX_API_KEY;
const BASE_URL = 'https://api.telnyx.com/v2';

// Read the knowledge base and system prompt
const knowledgeBasePath = path.join(__dirname, '../apps/api/src/data/ortho-knowledge-base.json');
const systemPromptPath = path.join(__dirname, '../apps/api/src/data/ai-system-prompt.txt');

const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');

// Summarize knowledge base into instruction format
let kbSummary = '\n\n## KNOWLEDGE BASE:\n\n';
kbSummary += 'Use the following information to answer questions accurately:\n\n';

const categories = {};
knowledgeBase.forEach((entry) => {
  if (!categories[entry.category]) {
    categories[entry.category] = [];
  }
  categories[entry.category].push(entry);
});

Object.entries(categories).forEach(([category, entries]) => {
  kbSummary += `### ${category.replace('_', ' ').toUpperCase()}:\n\n`;
  entries.slice(0, 5).forEach((entry) => {
    kbSummary += `**Q:** ${entry.question}\n**A:** ${entry.answer}\n\n`;
  });
});

const fullPrompt = systemPrompt + kbSummary;
const PRACTICE_NAME = 'ProntoPlus';

// Replace placeholder with actual practice name
const finalPrompt = fullPrompt.replace(/\[PRACTICE_NAME\]/g, PRACTICE_NAME);

async function createAssistant() {
  const requestData = {
    name: 'Pronto Demo Receptionist',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    instructions: finalPrompt,
    greeting: `Hi! This is Pronto, the AI assistant for ${PRACTICE_NAME} Orthodontics. How can I help you today?`,
    description: 'AI receptionist for orthodontic practice - handles patient calls, answers questions about treatment, pricing, and insurance'
  };

  console.log('🚀 Creating Telnyx AI Assistant...');
  console.log('📝 Name:', requestData.name);
  console.log('🤖 Model:', requestData.model);
  console.log('📏 Instructions length:', finalPrompt.length, 'characters');

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestData);
    
    const options = {
      hostname: 'api.telnyx.com',
      path: '/v2/ai_assistants',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ AI Assistant created successfully!');
            console.log('📋 Assistant ID:', response.data.id);
            console.log('📋 Assistant Name:', response.data.name);
            resolve(response.data);
          } else {
            console.error('❌ Error creating assistant:', data);
            reject(new Error(`API returned ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function listAssistants() {
  console.log('📋 Listing existing Telnyx AI Assistants...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telnyx.com',
      path: '/v2/ai_assistants',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Found ${response.data.length} assistant(s):`);
            response.data.forEach((assistant) => {
              console.log(`  - ${assistant.name} (ID: ${assistant.id})`);
            });
            resolve(response.data);
          } else {
            console.error('❌ Error listing assistants:', data);
            reject(new Error(`API returned ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    // First list existing assistants
    await listAssistants();
    
    console.log('\n');
    
    // Then create new assistant
    const assistant = await createAssistant();
    
    console.log('\n✨ Setup complete!');
    console.log('\n📞 Next steps:');
    console.log('1. Link this assistant to your phone number in Telnyx Portal');
    console.log('2. Test by calling your demo number');
    console.log('3. Check admin dashboard for lead captures');
    console.log('\n🔗 Telnyx Portal: https://portal.telnyx.com/#/app/voice/ai-assistants');
    
  } catch (error) {
    console.error('\n❌ Failed to configure Telnyx AI Assistant:', error.message);
    console.error('\n💡 Alternative: Configure via Telnyx Portal manually');
    console.error('   See: docs/TELNYX_AI_ASSISTANT_SETUP.md');
    process.exit(1);
  }
}

main();
