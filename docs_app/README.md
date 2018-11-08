# RxJS documentation project

Everything in this folder is part of the documentation project. This includes

* the web site for displaying the documentation
* the dgeni configuration for converting source files to rendered files that can be viewed in the web site.

## Developer tasks

We use `npm` to manage the dependencies and to run build tasks.
You should run all these tasks from the `rxjs/docs_app` folder.
Here are the most important tasks you might need to use:

* `npm install` - install all the dependencies.
* `npm run setup` - install all the dependencies and run dgeni on the docs.

* `npm run build` - create a production build of the application (after installing dependencies, etc).

* `npm start` - run a development web server that watches the files; then builds the doc-viewer and reloads the page, as necessary.
* `npm run serve-and-sync` - run both the `docs-watch` and `start` in the same console.
* `npm run lint` - check that the doc-viewer code follows our style rules.
* `npm test` - watch all the source files, for the doc-viewer, and run all the unit tests when any change.
* `npm test -- --watch=false` - run all the unit tests once.
* `npm run e2e` - run all the e2e tests for the doc-viewer.

* `npm run docs` - generate all the docs from the source files.
* `npm run docs-watch` - watch the RxJS source and the docs files and run a short-circuited doc-gen for the docs that changed (don't work properly at the moment).
* `npm run docs-lint` - check that the doc gen code follows our style rules.
* `npm run docs-test` - run the unit tests for the doc generation code.

* `npm run build-ie-polyfills` - generates a js file of polyfills that can be loaded in Internet Explorer.

## Using ServiceWorker locally

Running `npm run start` (even when explicitly targeting production mode) does not set up the
ServiceWorker. If you want to test the ServiceWorker locally, you can use `npm run build` and then
serve the files in `dist/` with `npm run http-server -- dist -p 4200`.

## Guide to authoring

There are two types of content in the documentation:

* **API docs**: descriptions of the modules, classes, interfaces, etc that make up RxJS.
API docs are generated directly from the source code.
The source code is contained in TypeScript files, located in the `rxjs/src` folder.
Each API item may have a preceding comment, which contains JSDoc style tags and content.
The content is written in markdown.

* **Other content**: guides, tutorials, and other marketing material.
All other content is written using markdown in text files, located in the `rxjs/docs_app/content` folder.
More specifically, there are sub-folders that contain particular types of content: guides, tutorial and marketing.

### Generating the complete docs

The main task for generating the docs is `npm run docs`. This will process all the source files (API and other),
extracting the documentation and generating JSON files that can be consumed by the doc-viewer.

### Partial doc generation for editors

Full doc generation can take up to one minute. That's too slow for efficient document creation and editing.

You can make small changes in a smart editor that displays formatted markdown:
>In VS Code, _Cmd-K, V_ opens markdown preview in side pane; _Cmd-B_ toggles left sidebar

You also want to see those changes displayed properly in the doc viewer
with a quick, edit/view cycle time.

For this purpose, use the `npm run docs-watch` task, which watches for changes to source files and only
re-processes the the files necessary to generate the docs that are related to the file that has changed.
Since this task takes shortcuts, it is much faster (often less than 1 second) but it won't produce full
fidelity content. For example, links to other docs and code examples may not render correctly. This is
most particularly noticed in links to other docs and in the embedded examples, which may not always render
correctly.

The general setup is as follows:

* Open a terminal, ensure the dependencies are installed; run an initial doc generation; then start the doc-viewer:

```bash
npm run setup
npm run start
```

* Open a second terminal and start watching the docs

```bash
npm run docs-watch
```

>Alternatively, try the consolidated `serve-and-sync` command that builds, watches and serves in the same terminal window
```bash
npm run serve-and-sync
```

* Open a browser at https://localhost:4200/ and navigate to the document on which you want to work.
You can automatically open the browser by using `npm start -- -o` in the first terminal.

* Make changes to the page's associated doc or example files. Every time a file is saved, the doc will
be regenerated, the app will rebuild and the page will reload.

* If you get a build error complaining about examples or any other odd behavior, be sure to consult
the [Authors Style Guide](https://angular.io/guide/docs-style-guide).

## Disclaimer

Starting the new documentation, we worked closely together with the Angular team and therefore adapted their way of generating docs. This leads to the effect, that there may be some references to angular (e.g. variable names, file names ...). Don't be confused by this, this shouldn't bother you. Thanks to the Angular Team for their support.
Anyway RxJS will always be an independent project, which aims to work closely with other technologies and frameworks!
