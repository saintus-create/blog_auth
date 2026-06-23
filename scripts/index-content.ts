import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Loading: Reads source.config.ts to obtain collection definitions
const configPath = path.join(__dirname, '../source.config.ts');

interface CollectionConfig {
  type: 'content' | 'data';
  schema: any;
}

interface Config {
  collections: Record<string, CollectionConfig>;
}

// Simple parser to extract collection definitions from source.config.ts
function parseConfig(configPath: string): Config {
  const content = fs.readFileSync(configPath, 'utf-8');
  
  // Extract collection names from the export statement
  const collectionsMatch = content.match(/export const collections = \{([^}]+)\}/s);
  if (!collectionsMatch) {
    throw new Error('Could not find collections export in source.config.ts');
  }
  
  const collectionsBlock = collectionsMatch[1];
  const collectionNames = collectionsBlock.match(/(\w+)/g) || [];
  
  const collections: Record<string, CollectionConfig> = {};
  collectionNames.forEach(name => {
    if (name !== 'blog' && name !== 'projects') return;
    collections[name] = {
      type: 'content',
      schema: {}
    };
  });
  
  return { collections };
}

// Index File Generation: Generates .source/index.ts with type-safe exports for all documents and metadata
function generateIndexFile(config: Config) {
  const sourceDir = path.join(__dirname, '../src/content');
  const outputDir = path.join(__dirname, '../.source');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let indexContent = '// Auto-generated content index\n';
  indexContent += '// DO NOT EDIT MANUALLY - run `npm run index:content` to regenerate\n\n';
  
  // Generate type-safe exports for each collection
  for (const [collectionName, collectionConfig] of Object.entries(config.collections)) {
    const collectionPath = path.join(sourceDir, collectionName);
    
    if (!fs.existsSync(collectionPath)) {
      console.log(`Collection directory not found: ${collectionPath}`);
      continue;
    }
    
    indexContent += `// ${collectionName} collection\n`;
    indexContent += `export const ${collectionName} = {\n`;
    
    // Recursively find all content files
    const files = getAllFiles(collectionPath, ['.md', '.mdx']);
    
    files.forEach(file => {
      const relativePath = path.relative(collectionPath, file);
      const id = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      const importPath = path.relative(outputDir, file).replace(/\\/g, '/');
      
      indexContent += `  '${id}': () => import('${importPath}'),\n`;
    });
    
    indexContent += `} as const;\n\n`;
  }
  
  // Export collection metadata
  indexContent += `export const collections = {\n`;
  for (const collectionName of Object.keys(config.collections)) {
    indexContent += `  ${collectionName},\n`;
  }
  indexContent += `} as const;\n`;
  
  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
  console.log('Generated .source/index.ts');
}

// Helper to get all files with specific extensions
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
try {
  const config = parseConfig(configPath);
  generateIndexFile(config);
  console.log('Content indexing complete');
} catch (error) {
  console.error('Error during content indexing:', error);
  process.exit(1);
}
