import {
  loadTypeDocJSON,
  findReflectionByName,
  formatSignature,
  formatType,
  extractStability,
  getDescription,
  organizeByModules,
  filterInternalItems
} from './typedoc-to-markdown.js';
import { embedMarbleDiagram } from './marble-diagrams.js';
import type { Reflection, DeclarationReflection, SignatureReflection } from 'typedoc';

export function generateModuleMarkdown(moduleName: string, project: ProjectReflection): string {
  const modules = organizeByModules(project);
  const items = filterInternalItems(modules.get(moduleName) || []);

  let markdown = `# ${moduleName} Module\n\n`;

  if (items.length === 0) {
    markdown += 'No items found in this module.\n';
    return markdown;
  }

  markdown += '## Exports\n\n';

  for (const item of items) {
    const stability = extractStability(item);
    const stabilityBadge = stability ? ` <span class="api-status-badge ${stability}">${stability}</span>` : '';
    markdown += `- [${item.name}](/api/${moduleName}/${item.name.toLowerCase()}) <span class="api-type-badge">${item.kindString}</span>${stabilityBadge}\n`;
  }

  return markdown;
}

export function generateApiItemMarkdown(
  moduleName: string,
  itemName: string,
  project: ProjectReflection
): string {
  // Find the reflection - need to search case-insensitively
  let reflection: Reflection | null = null;

  const modules = organizeByModules(project);
  const items = modules.get(moduleName) || [];

  // Find item by name (case-insensitive)
  const item = items.find(i =>
    i.name.toLowerCase() === itemName.toLowerCase()
  );

  if (!item) {
    return `# ${itemName}\n\nAPI item not found.\n`;
  }

  // Find the actual reflection
  function findReflectionById(project: ProjectReflection, id: number): Reflection | null {
    function search(r: Reflection): Reflection | null {
      if (r.id === id) return r;
      if (r.children) {
        for (const child of r.children) {
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

  reflection = findReflectionById(project, item.id);

  if (!reflection) {
    return `# ${itemName}\n\nAPI item not found.\n`;
  }

  const decl = reflection as DeclarationReflection;
  const description = getDescription(reflection);
  const stability = extractStability(item);
  const marbleDiagram = embedMarbleDiagram(itemName);

  let markdown = `# ${reflection.name}\n\n`;

  // Header with badges
  markdown += '<div class="api-header">\n';
  markdown += `  <span class="api-type-badge">${reflection.kindString || 'Unknown'}</span>\n`;
  if (stability === 'deprecated') {
    markdown += '  <span class="api-status-badge deprecated">deprecated</span>\n';
  }
  if (stability === 'experimental') {
    markdown += '  <span class="api-status-badge experimental">experimental</span>\n';
  }
  if (stability === 'stable') {
    markdown += '  <span class="api-status-badge stable">stable</span>\n';
  }
  markdown += '</div>\n\n';

  // Description
  if (description) {
    markdown += `${description}\n\n`;
  }

  // Marble diagram
  if (marbleDiagram) {
    markdown += `${marbleDiagram}\n`;
  }

  // Signatures
  if (decl.signatures && decl.signatures.length > 0) {
    markdown += '## Signatures\n\n';
    for (const signature of decl.signatures) {
      const sig = signature as SignatureReflection;
      const sigText = formatSignature(sig);
      markdown += '```typescript\n';
      markdown += `${sigText}\n`;
      markdown += '```\n\n';

      if (sig.comment) {
        const sigComment = getDescription(sig);
        if (sigComment) {
          markdown += `${sigComment}\n\n`;
        }
      }
    }
  }

  // Parameters
  if (decl.signatures?.[0]?.parameters && decl.signatures[0].parameters.length > 0) {
    markdown += '## Parameters\n\n';
    markdown += '| Name | Type | Description |\n';
    markdown += '|------|------|-------------|\n';

    for (const param of decl.signatures[0].parameters) {
      const paramType = formatType(param.type);
      const paramDesc = getDescription(param);
      markdown += `| ${param.name} | \`${paramType}\` | ${paramDesc || '-'} |\n`;
    }
    markdown += '\n';
  }

  // Return type
  if (decl.signatures?.[0]?.type) {
    markdown += '## Returns\n\n';
    markdown += `\`${formatType(decl.signatures[0].type)}\`\n\n`;
  }

  // Type definition (for type aliases, interfaces, etc.)
  if (decl.type && !decl.signatures) {
    markdown += '## Type\n\n';
    markdown += '```typescript\n';
    markdown += `type ${reflection.name} = ${formatType(decl.type)}\n`;
    markdown += '```\n\n';
  }

  return markdown;
}

