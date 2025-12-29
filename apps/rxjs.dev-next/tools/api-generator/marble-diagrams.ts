import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MARBLE_DIAGRAMS_PATH = resolve(__dirname, '../../docs/public/images/marble-diagrams');

export function getMarbleDiagramPath(operatorName: string): string | null {
  // Try different extensions
  const extensions = ['.svg', '.png'];
  
  for (const ext of extensions) {
    const path = resolve(MARBLE_DIAGRAMS_PATH, `${operatorName}${ext}`);
    if (existsSync(path)) {
      return `/images/marble-diagrams/${operatorName}${ext}`;
    }
  }
  
  return null;
}

export function embedMarbleDiagram(operatorName: string): string {
  const diagramPath = getMarbleDiagramPath(operatorName);
  
  if (!diagramPath) {
    return '';
  }
  
  return `\n\n![Marble diagram for ${operatorName}](${diagramPath})\n\n`;
}

export function extractMarbleDiagramFromComment(comment: string): string | null {
  // Look for references to marble diagrams in JSDoc comments
  // Pattern: @marble or mentions of marble diagram
  const marbleMatch = comment.match(/marble\s+diagram[:\s]+([^\s]+)/i);
  if (marbleMatch) {
    return marbleMatch[1];
  }
  
  // Check for explicit @marble tag
  const tagMatch = comment.match(/@marble\s+([^\s]+)/i);
  if (tagMatch) {
    return tagMatch[1];
  }
  
  return null;
}

