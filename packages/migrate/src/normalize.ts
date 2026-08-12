import ts from 'typescript';

export interface NormalizeSelectedCaseOptions {
  readonly bindings?: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * Removes generator scaffolding that has only one possible execution. This is
 * intentionally independent of rxTest and framework conversion.
 */
export function normalizeSelectedCase(source: string, options: NormalizeSelectedCaseOptions = {}): string {
  const sourceFile = ts.createSourceFile('selected-case.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const bindings = new Map(Object.entries(options.bindings ?? {}));
  const result = ts.transform(sourceFile, [
    (context) => {
      const { factory } = context;
      const visit: ts.Visitor = (node) => {
        if (
          ts.isForOfStatement(node) &&
          ts.isVariableDeclarationList(node.initializer) &&
          node.initializer.declarations.length === 1 &&
          ts.isArrayLiteralExpression(node.expression) &&
          node.expression.elements.length === 1
        ) {
          const declaration = node.initializer.declarations[0];
          const value = node.expression.elements[0];
          if (declaration && value) {
            const directDeclaration = factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(declaration.name, undefined, undefined, ts.visitNode(value, visit) as ts.Expression)],
                ts.NodeFlags.Const
              )
            );
            const body = ts.visitNode(node.statement, visit) as ts.Statement;
            return factory.createBlock(
              [directDeclaration, ...(ts.isBlock(body) ? body.statements : [body])],
              true
            );
          }
        }

        if (ts.isIdentifier(node) && bindings.has(node.text)) {
          return literal(factory, bindings.get(node.text));
        }

        return ts.visitEachChild(node, visit, context);
      };
      return (root) => ts.visitNode(root, visit) as ts.SourceFile;
    },
  ]);
  const transformed = result.transformed[0];
  if (!transformed) throw new Error('TypeScript did not return a transformed source file.');
  const output = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(transformed);
  result.dispose();
  return output;
}

function literal(factory: ts.NodeFactory, value: string | number | boolean | null | undefined): ts.Expression {
  if (value === null) return factory.createNull();
  if (typeof value === 'string') return factory.createStringLiteral(value);
  if (typeof value === 'number') return factory.createNumericLiteral(value);
  if (typeof value === 'boolean') return value ? factory.createTrue() : factory.createFalse();
  return factory.createIdentifier('undefined');
}
