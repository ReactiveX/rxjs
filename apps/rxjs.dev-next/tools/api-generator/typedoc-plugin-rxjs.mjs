// @ts-check
import { ReflectionKind, Converter } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Formats the description section by extracting the first sentence/paragraph as a blockquote
 * and rendering the rest as a Description section.
 *
 * @param {import('typedoc').Reflection} model - The reflection model
 * @param {any} context - The markdown theme context (from content.begin hook)
 * @returns {string} The formatted description markdown
 */
function formatDescriptionSection(model, context) {
  // Only process reflections that have comments (classes, interfaces, functions, etc.)
  if (!model || !model.comment || !model.comment.summary || model.comment.summary.length === 0) {
    return '';
  }

  // Get the full comment summary as markdown
  const fullSummary = context.helpers.getCommentParts(model.comment.summary);

  if (!fullSummary || !fullSummary.trim()) {
    return '';
  }

  // Split summary into first sentence/paragraph and rest
  // Try to find the first sentence (ending with period, exclamation, or question mark)
  const firstSentenceMatch = fullSummary.trim().match(/^([^.!?]+[.!?])\s*(.*)$/s);

  let firstPart = '';
  let restPart = '';

  if (firstSentenceMatch) {
    firstPart = firstSentenceMatch[1].trim();
    restPart = firstSentenceMatch[2].trim();
  } else {
    // If no sentence ending found, take first paragraph or first 200 chars
    const firstParagraphMatch = fullSummary.trim().match(/^([^\n]+)\n\n(.*)$/s);
    if (firstParagraphMatch) {
      firstPart = firstParagraphMatch[1].trim();
      restPart = firstParagraphMatch[2].trim();
    } else {
      // Fallback: take first 200 chars as first part
      const splitPoint = Math.min(200, fullSummary.trim().length);
      firstPart = fullSummary.trim().substring(0, splitPoint).trim();
      restPart = fullSummary.trim().substring(splitPoint).trim();
    }
  }

  let output = '';

  // Render first part as a blockquote note
  if (firstPart) {
    // Split into lines and add > prefix to each line
    const noteLines = firstPart.split('\n').map(line => `> ${line}`).join('\n');
    output += `${noteLines}\n\n`;
  }

  // Render rest as Description section if there's more content
  if (restPart || (model.comment.blockTags && model.comment.blockTags.length > 0)) {
    output += '## Description\n\n';

    if (restPart) {
      output += `${restPart}\n\n`;
    }

    // Render block tags (excluding @example, @param, @returns which are handled elsewhere)
    if (model.comment.blockTags) {
      const relevantTags = model.comment.blockTags.filter(
        tag => !['@example', '@param', '@returns', '@throws', '@see'].includes(tag.tag)
      );

      if (relevantTags.length > 0) {
        for (const tag of relevantTags) {
          const tagContent = context.helpers.getCommentParts(tag.content);
          if (tagContent && tagContent.trim()) {
            output += `**${tag.tag.substring(1)}**: ${tagContent}\n\n`;
          }
        }
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
 * Filters CallSignature overloads without comments when multiple signatures exist.
 *
 * @param {import('typedoc').DeclarationReflection} declReflection - The declaration reflection
 * @param {import('typedoc').Application} app - The TypeDoc application instance
 */
function filterCallSignatureOverloads(declReflection, app) {
  if (!Array.isArray(declReflection.signatures)) {
    return;
  }

  // Remove typeParameters from each signature
  for (const signature of declReflection.signatures) {
    if (signature && 'typeParameters' in signature && Array.isArray(signature.typeParameters)) {
      signature.typeParameters = [];
    }
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
    // If we only have CallSignatures, keep at least one (prefer one with comment, or the last one)
    if (otherSignatures.length > 0) {
      // We have non-CallSignature signatures, so filter all CallSignatures without comments
      declReflection.signatures = [
        ...otherSignatures,
        ...callSignaturesWithComments
      ];
    } else if (callSignaturesWithComments.length > 0) {
      // Only CallSignatures, but some have comments - keep only those with comments
      declReflection.signatures = callSignaturesWithComments;
    } else if (callSignatures.length > 0) {
      // Only CallSignatures and none have comments - keep the last one (likely the implementation)
      // This ensures we don't remove all signatures
      declReflection.signatures = [callSignatures[callSignatures.length - 1]];
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
  // Remove typeParameters from declarations and signatures
  removeTypeParameters(reflection, app);

  // Check if this is a DeclarationReflection with signatures
  if (reflection && 'signatures' in reflection) {
    const declReflection = /** @type {import('typedoc').DeclarationReflection} */ (reflection);
    filterCallSignatureOverloads(declReflection, app);
  }

  // Filter out type parameters from children
  if (reflection && 'children' in reflection) {
    const declReflection = /** @type {import('typedoc').DeclarationReflection} */ (reflection);
    filterTypeParameterChildren(declReflection, app);

    // Recursively process remaining children
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
 *    - Extracts the first sentence or paragraph from JSDoc comments and renders it as a blockquote note
 *    - Renders the remaining comment content as a "Description" section
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
 * 4. **Signature Filtering**
 *    - Filters out CallSignature overloads that don't have their own comments when multiple signatures exist
 *    - Preserves at least one signature (preferring one with comments, or the last one as fallback)
 *    - Only filters when there are multiple signatures (indicating overloads)
 *    - Separates CallSignatures from other signature types (e.g., ConstructSignatures)
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

    // Remove empty Type Parameters sections
    page.contents = removeEmptyTypeParameters(page.contents);

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
