// @ts-check
import { ReflectionKind, Converter } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

function formatInlineTypeReferences(content) {
  return content
    .split(/(`[^`]*`)/g)
    .map((segment) => segment.startsWith('`')
      ? segment
      : segment.replace(
          /\b([A-Za-z_$][\w.$]*)<([A-Za-z_$][\w.$]*(?:\s*,\s*[A-Za-z_$][\w.$]*)*)>/g,
          '$1&lt;$2&gt;'
        ))
    .join('');
}

function formatStandaloneTypeReferences(content) {
  return content.replace(
    /^([A-Za-z_$][\w.$]*)<([^>\n]+)>$/gm,
    (_match, typeName, typeParameters) => `\`${typeName}<${typeParameters}>\``
  );
}

function formatInformalBlocks(content) {
  return content.replace(/<span class="informal">([\s\S]*?)<\/span>/g, (_match, informal) => {
    const lines = informal.replace(/`/g, '').trim().split('\n');
    return lines.map((line) => `> ${line}`).join('\n');
  });
}

function escapeGenericMarkup(content) {
  let inFence = false;
  return content.split('\n').map((line) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return line;
    }
    if (inFence) {
      return line;
    }
    return line
      .split(/(`[^`]*`)/g)
      .map((segment) => segment.startsWith('`')
        ? segment
        : segment.replace(/\b([A-Za-z_$][\w.$]*)<(?!\/)([^>\n]+)>/g, '$1&lt;$2&gt;'))
      .join('');
  }).join('\n');
}

/**
 * Formats the description section by extracting the first paragraph and rendering it under a Description header.
 * Also removes the first paragraph from the TypeDoc model to prevent duplication.
 *
 * @param {import('typedoc').Reflection} model - The reflection model
 * @param {any} context - The markdown theme context (from content.begin hook)
 * @returns {string} The formatted description markdown
 */
function formatDescriptionSection(model, context) {
  // Only process reflections that have comments (classes, interfaces, functions, etc.)
  const isPackage = model.kind === 2;
  if (!model || !model.comment || !model.comment.summary || model.comment.summary.length === 0 || isPackage) {
    return '';
  }

  // Get the full comment summary as markdown
  const fullSummary = formatInlineTypeReferences(context.helpers.getCommentParts(model.comment.summary));

  if (!fullSummary || !fullSummary.trim()) {
    return '';
  }

  // Split on double newline (paragraph break) to get first paragraph
  const trimmedSummary = fullSummary.trim();
  const paragraphMatch = trimmedSummary.match(/^([^\n]+(?:\n[^\n]+)*)\n\n(.*)$/s);

  let firstParagraph = '';

  if (paragraphMatch) {
    firstParagraph = paragraphMatch[1].trim();

    // Remove the first paragraph from the TypeDoc model's comment summary
    // We'll render the full description ourselves, so we need to prevent TypeDoc from rendering it
    if (model.comment.summary) {
      model.comment.summary = [];
    }
  }

  // Build output: first paragraph as blockquote, then Description section with full description
  let output = '';

  // Render first paragraph as blockquote if it exists
  if (firstParagraph) {
    const blockquoteLines = firstParagraph.split('\n').map(line => `> ${line}`).join('\n');
    output += `${blockquoteLines}\n\n`;
  }

  // Render full description in Description section
  output += '## Description\n\n';

  // If we extracted a first paragraph, show the rest; otherwise show the full summary
  const remainingDescription = firstParagraph
    ? trimmedSummary.replace(firstParagraph, '').trim()
    : trimmedSummary;
  if (remainingDescription) {
    output += `${remainingDescription}\n\n`;
  }

  // Render relevant block tags if they exist
  if (model.comment.blockTags && model.comment.blockTags.length > 0) {
    // Filter relevant block tags (excluding @example, @param, @returns which are handled elsewhere)
    const relevantTags = model.comment.blockTags.filter(
      tag => !['@example', '@param', '@returns', '@throws', '@see'].includes(tag.tag)
    );

    // Render block tags
    for (const tag of relevantTags) {
      const tagContent = context.helpers.getCommentParts(tag.content);
      if (tagContent && tagContent.trim()) {
        output += `**${tag.tag.substring(1)}**: ${tagContent}\n\n`;
      }
    }
  }

  return output;
}

/**
 * Removes horizontal rules from markdown content.
 *
 * @param {string} content - The markdown content
 * @returns {string} Content with horizontal rules removed
 */
function removeHorizontalRules(content) {
  return content
    // Remove HTML hr tags (with optional attributes)
    .replace(/<hr\s*\/?>/gi, '')
    // Remove markdown horizontal rules (3+ dashes, asterisks, or underscores on their own line)
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Clean up multiple consecutive blank lines that might result
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Removes empty Type Parameters sections from markdown content.
 *
 * @param {string} content - The markdown content
 * @returns {string} Content with empty Type Parameters sections removed
 */
function removeEmptyTypeParameters(content) {
  // Remove "## Type Parameters" heading followed by an empty table (just headers, no data rows)
  // This matches sections like:
  // ## Type Parameters
  //
  // | Type Parameter |
  // | ------ |
  // The table separator can have varying numbers of dashes
  return content.replace(
    /^## Type Parameters\s*\n+\|\s*Type Parameter\s*\|\s*\n\|\s*[-:]+\s*\|\s*\n(?=\n|##|$)/gm,
    ''
  );
}

/**
 * Converts standalone "Param" sections into a proper "Parameters" section with parameter names.
 * TypeDoc sometimes renders @param tags as separate "## Param" sections without parameter names.
 * This function collects them and formats them properly.
 *
 * @param {string} content - The markdown content
 * @param {import('typedoc').Reflection} model - The reflection model to extract parameter info from
 * @param {any} context - The markdown theme context for helper functions
 * @returns {string} Content with Param sections converted to Parameters section
 */
function convertParamSectionsToParameters(content, model, context) {
  // Match pattern: ## Param\n\n<description>
  const paramSectionRegex = /^## Param\s*\n\n([^\n]+(?:\n[^\n]+)*?)(?=\n##|\n###|$)/gm;

  const paramSections = [];
  let match;

  // Collect all Param sections
  while ((match = paramSectionRegex.exec(content)) !== null) {
    paramSections.push({
      description: match[1].trim(),
      index: match.index
    });
  }

  // If we found Param sections, replace them with a proper Parameters section
  if (paramSections.length > 0) {
    // Extract parameter names from @param tags in the JSDoc comments
    const paramNames = [];
    if (model && model.comment && model.comment.blockTags) {
      const paramTags = model.comment.blockTags.filter(tag => tag.tag === '@param');
      paramNames.push(...paramTags.map(tag => tag.name).filter(Boolean));
    }

    // Build the Parameters section
    let parametersSection = '## Parameters\n\n';

    for (let i = 0; i < paramSections.length; i++) {
      const paramName = paramNames[i] || `param${i + 1}`;
      parametersSection += `### \`${paramName}\`\n\n${paramSections[i].description}\n\n`;
    }

    // Remove all the individual Param sections
    content = content.replace(/^## Param\s*\n\n[^\n]+(?:\n[^\n]+)*?(?=\n##|\n###|$)/gm, '');

    // Find where to insert the Parameters section (after Examples, before Call Signature)
    const examplesEndMatch = content.match(/^## Examples[\s\S]*?(?=\n## (?:Call Signature|Param|$))/m);
    if (examplesEndMatch && examplesEndMatch.index !== undefined) {
      // Insert after Examples section
      const insertIndex = examplesEndMatch.index + examplesEndMatch[0].length;
      content = content.slice(0, insertIndex) + '\n' + parametersSection + content.slice(insertIndex);
    } else {
      // Insert before first Call Signature or at the end
      const callSignatureMatch = content.match(/^## Call Signature/m);
      if (callSignatureMatch && callSignatureMatch.index !== undefined) {
        content = content.slice(0, callSignatureMatch.index) + parametersSection + content.slice(callSignatureMatch.index);
      } else {
        // Append at the end
        content += '\n' + parametersSection;
      }
    }
  }

  return content;
}

/**
 * Adds a Returns section from @returns JSDoc tag if it exists.
 * The Returns section should appear after Parameters and before Call Signature sections.
 *
 * @param {string} content - The markdown content
 * @param {import('typedoc').Reflection} model - The reflection model to extract return info from
 * @param {any} context - The markdown theme context for helper functions
 */
function addReturnsSection(content, model, context) {
  // Check if @returns tag exists in JSDoc
  if (!model || !model.comment || !model.comment.blockTags) {
    return content;
  }

  const returnsTag = model.comment.blockTags.find(tag => tag.tag === '@returns' || tag.tag === '@return');
  if (!returnsTag) {
    return content;
  }

  // Extract return type and description from the @returns tag
  let returnType = '';
  let returnDescription = '';

  if (returnsTag.content && returnsTag.content.length > 0) {
    // Get the full content as markdown
    if (context && context.helpers && context.helpers.getCommentParts) {
      const fullContent = context.helpers.getCommentParts(returnsTag.content);
      // Try to extract type (usually first word before dash or colon)
      const typeMatch = fullContent.match(/^([^-:]+?)(?:\s*[-:]\s*|\s+)(.*)$/s);
      if (typeMatch) {
        returnType = typeMatch[1].trim();
        returnDescription = typeMatch[2].trim();
      } else {
        // No type specified, just description
        returnDescription = fullContent.trim();
      }
    } else {
      // Fallback: extract from content array, handling both text and inline-tag parts
      let fullText = '';
      for (const part of returnsTag.content) {
        if (part.kind === 'text') {
          fullText += part.text;
        } else if (part.kind === 'inline-tag') {
          // Handle inline tags like {@link ...}
          if (part.text) {
            fullText += part.text;
          }
        }
      }

      // Try to extract type (format: "Type - description" or "Type: description" or "Type description")
      const typeMatch = fullText.match(/^([^-:]+?)(?:\s*[-:]\s*|\s{2,})(.*)$/s);
      if (typeMatch) {
        returnType = typeMatch[1].trim();
        returnDescription = typeMatch[2].trim();
      } else {
        // No clear separator, check if first word looks like a type
        const words = fullText.trim().split(/\s+/);
        if (words.length > 1 && /^[A-Z]/.test(words[0])) {
          // First word capitalized, likely a type
          returnType = words[0];
          returnDescription = words.slice(1).join(' ');
        } else {
          // Just description
          returnDescription = fullText.trim();
        }
      }
    }
  }

  // Build the Returns section
  let returnsSection = '## Returns\n\n';
  if (returnType) {
    returnsSection += `\`${returnType}\`\n\n`;
  }
  if (returnDescription) {
    returnsSection += `${returnDescription}\n\n`;
  }

  // Check if Returns section already exists (look for "## Returns" followed by content)
  if (content.match(/^## Returns\s*\n/m)) {
    return content; // Already exists, don't add again
  }

  // Find where to insert the Returns section (after Parameters, before Call Signature)
  const parametersEndMatch = content.match(/^## Parameters[\s\S]*?(?=\n## (?:Call Signature|Returns|$))/m);
  if (parametersEndMatch && parametersEndMatch.index !== undefined) {
    // Insert after Parameters section
    const insertIndex = parametersEndMatch.index + parametersEndMatch[0].length;
    content = content.slice(0, insertIndex) + '\n' + returnsSection + content.slice(insertIndex);
  } else {
    // Insert before first Call Signature
    const callSignatureMatch = content.match(/^## Call Signature/m);
    if (callSignatureMatch && callSignatureMatch.index !== undefined) {
      content = content.slice(0, callSignatureMatch.index) + returnsSection + content.slice(callSignatureMatch.index);
    } else {
      // Append at the end if no Call Signature found
      content += '\n' + returnsSection;
    }
  }

  return content;
}

/**
 * Processes marble diagram images to support light/dark themes.
 * Replaces markdown images with picture elements if both theme versions exist.
 *
 * @param {string} content - The markdown content
 * @param {string} marbleDiagramsPath - Path to the marble diagrams directory
 * @returns {string} Content with marble diagrams processed
 */
function processMarbleDiagrams(content, marbleDiagramsPath) {
  // Helper function to check and replace image with picture element
  const processMarbleImage = (operatorName, extension, altText = '') => {
    // Skip if operatorName already has a theme suffix
    if (operatorName.endsWith('-light') || operatorName.endsWith('-dark')) {
      return null;
    }

    // Check if both light and dark versions exist
    const lightPath = resolve(marbleDiagramsPath, `${operatorName}-light${extension}`);
    const darkPath = resolve(marbleDiagramsPath, `${operatorName}-dark${extension}`);

    const hasLight = existsSync(lightPath);
    const hasDark = existsSync(darkPath);

    if (hasLight && hasDark) {
      // Both versions exist - return picture element
      const lightSrc = `/images/marble-diagrams/${operatorName}-light${extension}`;
      const darkSrc = `/images/marble-diagrams/${operatorName}-dark${extension}`;
      const alt = altText || 'Marble diagram';

      return `<div><img class="only-light" src="${lightSrc}" alt="${alt}" />
<img class="only-dark" src="${darkSrc}" alt="${alt}" /></div>`;
    }

    return null;
  };

  content = content.replace(
    /!\[([^\]]*)\]\((?:\.\/)?([^/)]+\.(?:png|svg))\)/g,
    (match, altText, fileName) => existsSync(resolve(marbleDiagramsPath, fileName))
      ? `![${altText}](/images/marble-diagrams/${fileName})`
      : ''
  );

  // Process markdown images: ![alt text](/images/marble-diagrams/operatorName.svg)
  return content.replace(
    /!\[([^\]]*)\]\s*\(([^)]*\/images\/marble-diagrams\/([^/)\-]+)(\.svg))\)/g,
    (match, altText, fullPath, operatorName, extension) => {
      const replacement = processMarbleImage(operatorName, extension, altText);
      return replacement || match;
    }
  );
}

/**
 * Removes type parameters from a reflection.
 *
 * @param {import('typedoc').Reflection} reflection - The reflection to process
 * @param {import('typedoc').Application} app - The TypeDoc application instance
 */
function removeTypeParameters(reflection, app) {
  if (reflection && 'typeParameters' in reflection) {
    const declReflection = /** @type {import('typedoc').DeclarationReflection | import('typedoc').SignatureReflection} */ (reflection);
    if (Array.isArray(declReflection.typeParameters) && declReflection.typeParameters.length > 0) {
      const originalLength = declReflection.typeParameters.length;
      declReflection.typeParameters = [];
      app.logger.verbose(
        `[typedoc-plugin-rxjs] Removed ${originalLength} typeParameter(s) from ${declReflection.name || 'reflection'}`
      );
    }
  }
}

/**
 * Processes CallSignature overloads to ensure all overloads are preserved for proper documentation.
 * Removes typeParameters from signatures but keeps all overloads visible.
 *
 * @param {import('typedoc').DeclarationReflection} declReflection - The declaration reflection
 * @param {import('typedoc').Application} app - The TypeDoc application instance
 */
function filterCallSignatureOverloads(declReflection, app) {
  if (!Array.isArray(declReflection.signatures)) {
    return;
  }

  const originalLength = declReflection.signatures.length;

  // Only filter if there are multiple signatures (indicating overloads)
  if (declReflection.signatures.length > 1) {
    // Separate CallSignatures from other signature types
    const callSignatures = declReflection.signatures.filter(
      (sig) => sig.kind === ReflectionKind.CallSignature
    );
    const otherSignatures = declReflection.signatures.filter(
      (sig) => sig.kind !== ReflectionKind.CallSignature
    );

    // Filter CallSignatures that don't have their own comments
    const callSignaturesWithComments = callSignatures.filter((signature) => {
      return signature.comment && (
        (signature.comment.summary && signature.comment.summary.length > 0) ||
        (signature.comment.blockTags && signature.comment.blockTags.length > 0)
      );
    });

    // If we have other signatures (non-CallSignature), filter all CallSignatures without comments
    // If we only have CallSignatures, keep all of them to properly render overloads
    if (otherSignatures.length > 0) {
      // We have non-CallSignature signatures, so filter all CallSignatures without comments
      declReflection.signatures = [
        ...otherSignatures,
        ...callSignaturesWithComments
      ];
    } else if (callSignaturesWithComments.length > 0) {
      // Only CallSignatures, but some have comments - keep all CallSignatures
      // This preserves overloads while showing the ones with comments
      // TypeDoc will handle rendering all signatures properly
      declReflection.signatures = callSignatures;
    } else if (callSignatures.length > 0) {
      // Only CallSignatures and none have individual comments - keep all of them
      // This ensures all overloads are shown, with the implementation (usually last) having the main JSDoc comment
      declReflection.signatures = callSignatures;
    }
  }

  if (declReflection.signatures.length !== originalLength) {
    app.logger.verbose(
      `[rxjs-docs-plugin] Filtered ${originalLength - declReflection.signatures.length} CallSignature(s) without comments from ${declReflection.name}`
    );
  }
}

/**
 * Filters TypeParameter kinds from children arrays.
 *
 * @param {import('typedoc').DeclarationReflection} declReflection - The declaration reflection
 * @param {import('typedoc').Application} app - The TypeDoc application instance
 */
function filterTypeParameterChildren(declReflection, app) {
  if (!Array.isArray(declReflection.children)) {
    return;
  }

  const originalLength = declReflection.children.length;
  // Filter out TypeParameter kinds
  declReflection.children = declReflection.children.filter(
    (child) => child.kind !== ReflectionKind.TypeParameter
  );

  if (declReflection.children.length !== originalLength) {
    app.logger.verbose(
      `[rxjs-docs-plugin] Filtered ${originalLength - declReflection.children.length} TypeParameter(s) from ${declReflection.name || 'reflection'}`
    );
  }
}

/**
 * Recursively filters CallSignature kinds without comments from all reflections.
 *
 * @param {import('typedoc').Reflection} reflection - The reflection to process
 * @param {import('typedoc').Application} app - The TypeDoc application instance
 */
function filterReflections(reflection, app) {
  // Check if this is a DeclarationReflection with signatures
  if (reflection && 'signatures' in reflection) {
    const declReflection = /** @type {import('typedoc').DeclarationReflection} */ (reflection);
    filterCallSignatureOverloads(declReflection, app);
  }

  if (reflection && 'children' in reflection) {
    const declReflection = /** @type {import('typedoc').DeclarationReflection} */ (reflection);

    // Recursively process children. Generic type parameters remain visible so
    // generated signatures never collapse to invalid empty `<>` lists.
    if (Array.isArray(declReflection.children)) {
      for (const child of declReflection.children) {
        filterReflections(child, app);
      }
    }
  }
}

/**
 * TypeDoc plugin for customizing markdown output for RxJS documentation.
 *
 * This plugin provides several enhancements to the generated markdown documentation:
 *
 * 1. **Description Section Formatting**
 *    - Adds a "Description" section header for all reflections with comments
 *    - Renders relevant block tags in the Description section if present
 *    - Note: TypeDoc already renders the comment summary automatically, so only the header and block tags are added here
 *    - Includes relevant block tags (excluding `@example`, `@param`, `@returns`, `@throws`, `@see` which are handled elsewhere)
 *
 * 2. **Horizontal Rule Removal**
 *    - Removes all HTML `<hr>` tags and markdown horizontal rules (---, ***, ___) from rendered pages
 *    - Cleans up resulting multiple consecutive blank lines
 *
 * 3. **Marble Diagram Theme Support**
 *    - Automatically detects marble diagram images in markdown format
 *    - Replaces single images with picture elements that support both light and dark themes
 *    - Looks for `-light` and `-dark` suffixed versions of images in `/images/marble-diagrams/`
 *    - Generates HTML with `only-light` and `only-dark` CSS classes for theme switching
 *
 * 4. **Signature Processing**
 *    - Preserves all CallSignature overloads to ensure proper documentation of function overloads
 *    - Removes typeParameters from signatures for cleaner documentation
 *    - Separates CallSignatures from other signature types (e.g., ConstructSignatures)
 *    - When only CallSignatures exist, all are kept to show complete overload information
 *
 * 5. **Type Parameter Removal**
 *    - Removes all typeParameters from declarations, signatures, and their children
 *    - Filters out TypeParameter reflection kinds from children arrays
 *    - This simplifies the generated documentation by hiding generic type parameters
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app - The TypeDoc markdown application instance
 */
export function load(app) {
  // Add hook to inject Description section at the top of content
  app.renderer.markdownHooks.on('content.begin', (context) => {
    return formatDescriptionSection(context.page.model, context);
  });

  // Remove all horizontal rule tags from the rendered markdown and process marble diagrams
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    // Remove HTML <hr> tags and markdown horizontal rules
    page.contents = removeHorizontalRules(page.contents);

    // Vue treats standalone generic type prose as an HTML element. Keep it as
    // inline code without disturbing intentional HTML used by the theme.
    page.contents = formatStandaloneTypeReferences(page.contents);
    page.contents = formatInformalBlocks(page.contents);
    page.contents = escapeGenericMarkup(page.contents);

    // Remove empty Type Parameters sections
    page.contents = removeEmptyTypeParameters(page.contents);

    // Convert standalone "Param" sections to proper "Parameters" section
    // Only process if model is a Reflection type (has comment property)
    if (page.model && 'comment' in page.model) {
      page.contents = convertParamSectionsToParameters(page.contents, page.model, null);
      // Add Returns section from @returns tag
      page.contents = addReturnsSection(page.contents, page.model, null);
    }

    // Process marble diagram images - replace HTML img tags and markdown images with picture elements
    const pluginPath = fileURLToPath(import.meta.url);
    const pluginDir = dirname(pluginPath);
    // Go up from tools/api-generator to apps/rxjs.dev-next/docs
    const docsDir = resolve(pluginDir, '../../docs');
    const marbleDiagramsPath = resolve(docsDir, 'public/images/marble-diagrams');

    // Process markdown images: ![alt text](/images/marble-diagrams/operatorName.svg)
    page.contents = processMarbleDiagrams(page.contents, marbleDiagramsPath);
  });

  // Use TypeDoc's converter hook to filter signatures after resolution
  app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
    // Process the project and all its children
    if (context.project) {
      filterReflections(context.project, app);
    }
  });
}
