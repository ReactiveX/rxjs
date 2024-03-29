# Decision Tree Generator

## Purpose

Manage a decision tree in YAML for choosing an operator and generate JSON to be consumed by the docs web app.

## Goals

- Port the first version of the decision-tree-widget into Angular
- Flatten the JSON structure and make it easy to work with in the docs web app
- Consume URI paths and other relevant from the docs generation task vai Dgeni
- Keep the decision tree work scalable and easy to work with by keeping the linked list structure in the YAML tree

## Prior Art

Version 1 was in the old docs site and used YAML, snabbdom, RxJS, and hyperscript-helpers. The YAML for version 1 version was ported into the new version with minor tweaks.

## Tech

- Node
- TypeScript
- TS-Node
- Jest
- YAML

## Dependencies

Generating the JSON requires:

- The decision tree YAML, located in `/src`
- The generated `api-list.json`, which can be generated by running `yarn docs` at the root level of the `apps/rxjs.dev`

## Setup & Build

```shell
npm i && yarn build
```

## Development

Any changes to the YAML tree or any of the TypeScript scripts will generate a new JSON tree

```shell
yarn watch
```

## Distribution

After a `yarn build` the JSON is output to `apps/rxjs.dev/src/generated/app/decision-tree-data.json` to be consumed by the web application.

There's also an npm script at the root level of the `apps/rxjs.dev` to generate the JSON tree: `docs-decision-tree`.

## Testing

Run a watch task when writing tests

```shell
yarn test:watch
```

Full test

```shell
yarn test
```

Run coverage

```shell
yarn test:coverage
yarn test:watch:coverage
```

## TODO

- Consider moving this work into a Dgeni package so it can be generated in the same way the other doc information is generated
