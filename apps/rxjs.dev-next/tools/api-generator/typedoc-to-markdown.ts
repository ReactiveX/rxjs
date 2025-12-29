import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ProjectReflection, Reflection, DeclarationReflection, SignatureReflection } from 'typedoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ApiItem {
  id: number;
  name: string;
  kind: string;
  kindString: string;
  module?: string;
  description?: string;
  signatures?: SignatureReflection[];
  children?: ApiItem[];
  type?: any;
  flags?: {
    isExported?: boolean;
    isPrivate?: boolean;
    isProtected?: boolean;
    isDeprecated?: boolean;
    isExperimental?: boolean;
    isStable?: boolean;
  };
  tags?: Array<{ tag: string; text?: string }>;
  sources?: Array<{ fileName: string; line: number }>;
}

export interface ModuleInfo {
  name: string;
  items: ApiItem[];
}

let cachedProject: ProjectReflection | null = null;
let cachePath: string | null = null;

export function loadTypeDocJSON(jsonPath?: string): ProjectReflection {
  const path = jsonPath || resolve(__dirname, '../.vitepress/cache/api-docs.json');
  
  // Cache the project if we've already loaded it
  if (cachedProject && cachePath === path) {
    return cachedProject;
  }

  const content = readFileSync(path, 'utf-8');
  const project = JSON.parse(content) as ProjectReflection;
  
  cachedProject = project;
  cachePath = path;
  
  return project;
}

export function getModuleName(reflection: Reflection): string {
  // Extract module name from reflection path
  // TypeDoc structure: reflections are organized by modules
  if (reflection.parent?.kindString === 'Module') {
    return reflection.parent.name;
  }
  
  // Try to extract from sources
  if (reflection.sources?.[0]?.fileName) {
    const fileName = reflection.sources[0].fileName;
    // Extract module from path like "packages/rxjs/src/operators/map.ts"
    const match = fileName.match(/src\/([^/]+)/);
    if (match) {
      return match[1] === 'index' ? 'index' : match[1];
    }
  }
  
  return 'index';
}

export function filterInternalItems(items: ApiItem[]): ApiItem[] {
  return items.filter(item => {
    // Filter out items starting with _ or ɵ (internal)
    if (item.name.startsWith('_') || item.name.startsWith('ɵ') || item.name === 'VERSION') {
      return false;
    }
    
    // Filter out private items
    if (item.flags?.isPrivate) {
      return false;
    }
    
    // Filter out items with @internal tag
    if (item.tags?.some(tag => tag.tag === 'internal')) {
      return false;
    }
    
    return true;
  });
}

export function extractStability(item: ApiItem): 'stable' | 'experimental' | 'deprecated' | undefined {
  if (item.flags?.isDeprecated || item.tags?.some(tag => tag.tag === 'deprecated')) {
    return 'deprecated';
  }
  if (item.flags?.isExperimental || item.tags?.some(tag => tag.tag === 'experimental')) {
    return 'experimental';
  }
  if (item.flags?.isStable || item.tags?.some(tag => tag.tag === 'stable')) {
    return 'stable';
  }
  return undefined;
}

export function getDescription(item: ApiItem | Reflection): string {
  if ('comment' in item && item.comment) {
    if (typeof item.comment === 'string') {
      return item.comment;
    }
    if (item.comment.summary) {
      return item.comment.summary
        .map(part => (typeof part === 'string' ? part : part.text))
        .join('');
    }
  }
  return '';
}

export function formatSignature(signature: SignatureReflection): string {
  const params = signature.parameters?.map(p => {
    const name = p.name;
    const type = formatType(p.type);
    const optional = p.flags?.isOptional ? '?' : '';
    return `${name}${optional}: ${type}`;
  }).join(', ') || '';
  
  const returnType = signature.type ? formatType(signature.type) : 'void';
  return `(${params}) => ${returnType}`;
}

export function formatType(type: any): string {
  if (!type) return 'any';
  
  if (type.type === 'intrinsic') {
    return type.name;
  }
  
  if (type.type === 'reference') {
    if (type.name) {
      return type.name;
    }
    if (type.reflection) {
      return type.reflection.name || 'unknown';
    }
  }
  
  if (type.type === 'array') {
    return `${formatType(type.elementType)}[]`;
  }
  
  if (type.type === 'union') {
    return type.types.map((t: any) => formatType(t)).join(' | ');
  }
  
  if (type.type === 'intersection') {
    return type.types.map((t: any) => formatType(t)).join(' & ');
  }
  
  if (type.type === 'tuple') {
    return `[${type.elements.map((e: any) => formatType(e)).join(', ')}]`;
  }
  
  if (type.type === 'typeParameter') {
    return type.name;
  }
  
  if (type.type === 'reflection') {
    if (type.declaration?.signatures) {
      return formatSignature(type.declaration.signatures[0]);
    }
  }
  
  return 'unknown';
}

export function organizeByModules(project: ProjectReflection): Map<string, ApiItem[]> {
  const modules = new Map<string, ApiItem[]>();
  
  function processReflection(reflection: Reflection, moduleName: string = 'index') {
    if (reflection.kindString === 'Module') {
      moduleName = reflection.name;
    }
    
    // Only process exported items
    if (reflection.flags?.isExported && !reflection.flags?.isPrivate) {
      const item: ApiItem = {
        id: reflection.id,
        name: reflection.name,
        kind: reflection.kind.toString(),
        kindString: reflection.kindString || '',
        module: moduleName,
        description: getDescription(reflection),
        flags: {
          isExported: reflection.flags?.isExported,
          isPrivate: reflection.flags?.isPrivate,
          isProtected: reflection.flags?.isProtected,
        },
        tags: reflection.comment?.blockTags?.map(tag => ({
          tag: tag.tag,
          text: tag.content?.map(c => typeof c === 'string' ? c : c.text).join(''),
        })),
        sources: reflection.sources,
      };
      
      if ('signatures' in reflection && reflection.signatures) {
        item.signatures = reflection.signatures as SignatureReflection[];
      }
      
      if ('children' in reflection && reflection.children) {
        item.children = reflection.children
          .filter(child => !child.flags?.isPrivate)
          .map(child => ({
            id: child.id,
            name: child.name,
            kind: child.kind.toString(),
            kindString: child.kindString || '',
            module: moduleName,
            description: getDescription(child),
            flags: {
              isExported: child.flags?.isExported,
              isPrivate: child.flags?.isPrivate,
            },
            sources: child.sources,
          }));
      }
      
      if ('type' in reflection) {
        item.type = reflection.type;
      }
      
      // Filter out internal items
      if (!item.name.startsWith('_') && !item.name.startsWith('ɵ') && item.name !== 'VERSION') {
        if (!modules.has(moduleName)) {
          modules.set(moduleName, []);
        }
        modules.get(moduleName)!.push(item);
      }
    }
    
    // Process children
    if ('children' in reflection && reflection.children) {
      for (const child of reflection.children) {
        processReflection(child, moduleName);
      }
    }
  }
  
  // Process all children of the project
  if (project.children) {
    for (const child of project.children) {
      processReflection(child);
    }
  }
  
  return modules;
}

export function findReflectionById(project: ProjectReflection, id: number): Reflection | null {
  function search(reflection: Reflection): Reflection | null {
    if (reflection.id === id) {
      return reflection;
    }
    
    if ('children' in reflection && reflection.children) {
      for (const child of reflection.children) {
        const found = search(child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  if (project.children) {
    for (const child of project.children) {
      const found = search(child);
      if (found) return found;
    }
  }
  
  return null;
}

export function findReflectionByName(project: ProjectReflection, name: string, moduleName?: string): Reflection | null {
  function search(reflection: Reflection): Reflection | null {
    if (reflection.name === name) {
      if (!moduleName || getModuleName(reflection) === moduleName) {
        return reflection;
      }
    }
    
    if ('children' in reflection && reflection.children) {
      for (const child of reflection.children) {
        const found = search(child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  if (project.children) {
    for (const child of project.children) {
      const found = search(child);
      if (found) return found;
    }
  }
  
  return null;
}

