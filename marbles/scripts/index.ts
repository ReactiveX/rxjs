import { renderMarbleDiagram } from 'swirly-renderer-node';
import { readdir, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseMarbleDiagramSpec } from 'swirly-parser';
import { styles as defaultLight } from 'swirly-theme-default-light';
import { DiagramStyles } from 'swirly-types';
import * as SVGO from 'svgo';

const diagramsPath = join(process.cwd(), 'marbles', 'diagrams');
console.log(diagramsPath);
readdir(diagramsPath, (err, files) => {
    Promise.all(files.map(fileName => renderMarble(diagramsPath, fileName)))
        .then(_ => console.log('All SVGs created'))
        .catch(e => console.error('generating SVGs failed', e));
});

const renderMarble = (path: string, fileName: string): Promise<true> => {
    const file = readFileSync(join(path, fileName));
    const diagramSpec = parseMarbleDiagramSpec(file.toString());
    const { xml: unoptXml, width, height } = renderMarbleDiagram(diagramSpec, { styles });
    const optimizedSVGPromise = optimizeXml(unoptXml);
    return optimizedSVGPromise.then((svgXML) => {
        const svgFileName = fileName.split('.')[0] + '.svg';
        const svgPath = join(process.cwd(), 'docs_app', 'assets', 'images', 'svgs', svgFileName);
        writeFileSync(svgPath, svgXML, { encoding: 'utf-8', flag: 'w' });
        return true;
    })
};

const optimizeXml = async (unoptXml: string): Promise<string> => {
    const svgo = new SVGO({ plugins: [{ removeViewBox: false }] });
    const { data } = await svgo.optimize(unoptXml);
    return data;
};

const styles: DiagramStyles = {
    ...defaultLight,
    frame_width: 20,
    completion_height: 20,
    higher_order_angle: 30,
    arrow_fill_color: 'black',
    background_color: 'rgba(255, 255, 255, 0.0)',
    operator_fill_color: 'rgba(255, 255, 255, 0.0)'
};