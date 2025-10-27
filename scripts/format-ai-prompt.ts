#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to convert knowledge base JSON into formatted system prompt
 * for Telnyx AI Assistant configuration
 */

const knowledgeBasePath = path.join(__dirname, '../apps/api/src/data/ortho-knowledge-base.json');
const systemPromptPath = path.join(__dirname, '../apps/api/src/data/ai-system-prompt.txt');
const outputPath = path.join(__dirname, '../apps/api/src/data/enhanced-system-prompt.txt');

function formatKnowledgeBase() {
  const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
  const basePrompt = fs.readFileSync(systemPromptPath, 'utf8');
  
  // Group by category
  const categories: Record<string, any[]> = {};
  knowledgeBase.forEach((entry: any) => {
    if (!categories[entry.category]) {
      categories[entry.category] = [];
    }
    categories[entry.category].push(entry);
  });
  
  // Format knowledge base as instructions
  let knowledgeSection = '\n\n## KNOWLEDGE BASE:\n\n';
  knowledgeSection += 'Use the following information to answer questions accurately:\n\n';
  
  Object.entries(categories).forEach(([category, entries]) => {
    knowledgeSection += `### ${category.replace('_', ' ').toUpperCase()}:\n\n`;
    entries.forEach((entry: any) => {
      knowledgeSection += `**Question:** ${entry.question}\n`;
      knowledgeSection += `**Answer:** ${entry.answer}\n`;
      if (entry.follow_up_prompts && entry.follow_up_prompts.length > 0) {
        knowledgeSection += `**Follow-up:** ${entry.follow_up_prompts.join(', ')}\n`;
      }
      knowledgeSection += '\n';
    });
  });
  
  // Combine base prompt with knowledge base
  const enhancedPrompt = basePrompt + knowledgeSection;
  
  fs.writeFileSync(outputPath, enhancedPrompt, 'utf8');
  console.log('✅ Enhanced system prompt created at:', outputPath);
  console.log(`📊 Formatted ${knowledgeBase.length} knowledge base entries`);
  
  return enhancedPrompt;
}

if (require.main === module) {
  formatKnowledgeBase();
}
