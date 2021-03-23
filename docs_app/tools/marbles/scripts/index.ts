import { renderMarbleDiagram } from '@swirly/renderer-node';
import { readdir, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseMarbleDiagramSpecification } from '@swirly/parser';
import { DiagramStyles } from '@swirly/types';
import * as SVGO from 'svgo';

const styles: DiagramStyles = {
    frame_width: 20,
    completion_height: 20,
    higher_order_angle: 30,
    arrow_fill_color: 'black',
    background_color: 'rgba(255, 255, 255, 0.0)',
    operator_fill_color: 'rgba(255, 255, 255, 0.0)'
};

const optimizeXml = async (unoptXml: string): Promise<string> => {
    const svgo = new SVGO({ plugins: [{ removeViewBox: false }] });
    const { data } = await svgo.optimize(unoptXml);
    return data;
};

const renderMarble = (path: string, fileName: string): Promise<true> => {
    const file = readFileSync(join(path, fileName));
    const diagramSpec = parseMarbleDiagramSpecification(file.toString());
    const { xml: unoptXml } = renderMarbleDiagram(diagramSpec, { styles });
    const optimizedSVGPromise = optimizeXml(unoptXml);
    return optimizedSVGPromise.then((svgXML) => {
        const svgFileName = fileName.split('.')[0] + '.svg';
        const svgPath = join(process.cwd(), 'src', 'assets', 'images', 'marble-diagrams', svgFileName);
        writeFileSync(svgPath, svgXML, { encoding: 'utf-8', flag: 'w' });
        return true;
    });
};

const diagramsPath = join(process.cwd(), 'tools', 'marbles', 'diagrams');
readdir(diagramsPath, (err, files) => {
    Promise.all(files.map(fileName => renderMarble(diagramsPath, fileName)))
        .then(_ => console.log('All SVGs created'))
        .catch(e => console.error('generating SVGs failed', e));
});