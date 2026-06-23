import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Virtual Module Resolution: Handles mdx query parameters for on-demand MDX compilation
export function virtualMdxPlugin(): Plugin {
  const virtualModuleId = 'virtual:mdx-content';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'virtual-mdx',
    
    resolveId(id) {
      // Handle virtual module imports
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      
      // Handle MDX files with query parameters
      if (id.includes('?mdx')) {
        const filePath = id.split('?mdx')[0];
        return '\0' + filePath;
      }
      
      return null;
    },
    
    load(id) {
      // Resolve virtual module
      if (id === resolvedVirtualModuleId) {
        return `
          import { getCollection } from 'astro:content';
          
          export async function getMdxContent(collection: string, id: string) {
            const entries = await getCollection(collection);
            const entry = entries.find(e => e.id === id);
            return entry;
          }
          
          export async function getAllMdxContent(collection: string) {
            return await getCollection(collection);
          }
        `;
      }
      
      // Handle MDX files with query parameters
      if (id.startsWith('\0') && !id.includes('node_modules')) {
        const filePath = id.replace('\0', '');
        
        // Check if it's an MDX file
        if (filePath.endsWith('.mdx') || filePath.endsWith('.md')) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Return the content with MDX processing instructions
            return `
              import { jsx } from 'astro/jsx-runtime';
              const content = ${JSON.stringify(content)};
              export default content;
              export const frontmatter = {};
            `;
          } catch (error) {
            console.error(`Error loading MDX file: ${filePath}`, error);
            return null;
          }
        }
      }
      
      return null;
    },
    
    transform(code, id) {
      // Transform MDX files with query parameters
      if (id.includes('?mdx')) {
        const filePath = id.split('?mdx')[0];
        
        // Add MDX processing
        return {
          code: `
            import { MDXProvider } from '@mdx-js/react';
            ${code}
          `,
          map: null,
        };
      }
      
      return null;
    },
  };
}
