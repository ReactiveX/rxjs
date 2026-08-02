#!/usr/bin/env node

/**
 * Marble Diagram Generator
 *
 * Generates SVG marble diagrams from text specifications using @swirly.
 * Reads .txt files from tools/marbles/diagrams/ and outputs SVG files to
 * docs/public/images/marble-diagrams/
 */

import { renderMarbleDiagram } from '@swirly/renderer-node';
import { readdir, readFileSync, writeFileSync, mkdir } from 'fs';
import { join, resolve, dirname } from 'path';
import { parseMarbleDiagramSpecification } from '@swirly/parser';
import { DiagramStyles } from '@swirly/types';
import { optimize } from 'svgo';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const readdirAsync = promisify(readdir);
const mkdirAsync = promisify(mkdir);

// Light theme styles
const lightStyles: DiagramStyles = {
  frame_width: 20,
  completion_height: 20,
  higher_order_angle: 30,
  arrow_fill_color: 'black',
  background_color: 'rgb(246, 246, 247)',
  operator_fill_color: 'rgba(255, 255, 255, 0.0)'
};

// Dark theme styles
const darkStyles: DiagramStyles = {
  frame_width: 20,
  completion_height: 20,
  higher_order_angle: 30,
  arrow_fill_color: 'rgb(223, 223, 214)',
  arrow_stroke_color: 'rgb(223, 223, 214)',
  completion_stroke_color: 'rgb(223, 223, 214)',
  stream_title_color: 'rgb(223, 223, 214)',
  error_color: 'red',
  event_stroke_color: 'white',
  barrier_color: 'rgb(223, 223, 214)',
  background_color: 'rgb(27, 27, 31)',
  operator_fill_color: 'rgb(27, 27, 31)',
  operator_stroke_color: 'rgb(223, 223, 214)',
  operator_title_color: 'rgb(223, 223, 214)',
};

const optimizeXml = async (unoptXml: string): Promise<string> => {
  const result = await optimize(unoptXml, {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false
          }
        }
      }
    ]
  });
  return result.data || unoptXml;
};

const renderMarble = async (
  path: string,
  fileName: string,
  styles: DiagramStyles,
  suffix: string
): Promise<void> => {
  const file = readFileSync(join(path, fileName));
  const diagramSpec = parseMarbleDiagramSpecification(file.toString());
  const { xml: unoptXml } = renderMarbleDiagram(diagramSpec, { styles });
  let svgXML = await optimizeXml(unoptXml);

  // Post-process dark mode SVGs: inject style tag
  if (suffix === 'dark') {
    // Inject style tag right after the opening <svg> tag
    const styleBlock = `<style>
  circle {
    filter: saturate(200%) !important;
  }
</style>`;

    // Insert the style block right after the opening <svg> tag
    // Handle both minified (no newline) and formatted SVGs
    svgXML = svgXML.replace(/<svg([^>]*)>/, `<svg$1>\n${styleBlock}`);
  }

  const baseName = fileName.split('.')[0];
  const svgFileName = suffix ? `${baseName}-${suffix}.svg` : `${baseName}.svg`;
  const outputDir = resolve(__dirname, '../../docs/public/images/marble-diagrams');

  // Ensure output directory exists
  await mkdirAsync(outputDir, { recursive: true });

  const svgPath = join(outputDir, svgFileName);
  writeFileSync(svgPath, svgXML, { encoding: 'utf-8', flag: 'w' });
  console.log(`  ✓ Generated ${svgFileName}`);
};

async function main() {
  console.log('Generating marble diagrams...\n');

  const diagramsPath = resolve(__dirname, 'diagrams');

  try {
    const files = await readdirAsync(diagramsPath);
    const txtFiles = files.filter(file => file.endsWith('.txt'));

    if (txtFiles.length === 0) {
      console.log('No .txt files found in diagrams directory.');
      return;
    }

    console.log(`Found ${txtFiles.length} diagram specification(s):\n`);

    // Generate both light and dark versions for each diagram
    const renderTasks: Promise<void>[] = [];
    for (const fileName of txtFiles) {
      // Generate light version
      renderTasks.push(renderMarble(diagramsPath, fileName, lightStyles, 'light'));
      // Generate dark version
      renderTasks.push(renderMarble(diagramsPath, fileName, darkStyles, 'dark'));
    }

    await Promise.all(renderTasks);

    console.log(`\n✅ All ${txtFiles.length * 2} SVG(s) created successfully! (${txtFiles.length} light + ${txtFiles.length} dark)`);
  } catch (error) {
    console.error('\n❌ Error generating marble diagrams:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as generateMarbleDiagrams };
