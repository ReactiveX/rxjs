# AIO project tooling

This document gives an overview of the tools that we use to generate the content for the RxJS website.

The application that actually renders this content can be found in the `/docs_app/src` folder.
The handwritten content can be found in the `/docs_app/content` folder.

Each subfolder in this `/docs_app/tools/` folder contains a self-contained tool and its configuration. There is
a `README.md` file in each folder that describes the tool in more detail.

## transforms

All the content that is rendered by the RxJS docs application, and some of its configuration files,
are generated from source files by [Dgeni](https://github.com/angular/dgeni). Dgeni is a general
purpose documentation generation tool.

Markdown files in `/docs_app/content`, code comments in the core Angular source files and example
files are processed and transformed into files that are consumed by the RxJS docs application.

Dgeni is configured by "packages", which contain services and processors. Some of these packages are
installed as `node_modules` from the [dgeni-packages](https://github.com/angular/dgeni-packages) and
some are specific to the RxJS project.

The project specific packages are stored in the `/docs_app/tools/transforms` folder. See the
[README.md](transforms/README.md) for more details.
