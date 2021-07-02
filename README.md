# d8

`d8` is a pre-processor for coverage output from deno, making it palatable for
use with [`c8`](https://github.com/bcoe/c8). This enables access to `istanbul`'s
rich set of reporting options.

## Installation

`deno install --allow-read --allow-write -n d8 https://x.nest.land/d8@0.1.1/cli.ts`

## Usage

> NOTE

> - `c8` only consumes coverage output in `./coverage/tmp`
> - This means second argument to `d8 convert` should be set to `./coverage/tmp`

```
Usage:   d8
  Version: v0.1.0

  Description:

    Adapt deno coverage output to c8/nyc/istanbul reporting

  Options:

    -h, --help     - Show this help.
    -V, --version  - Show the version number for this program.

  Commands:

    convert  <deno-dir> <c8-dir>  - convert deno's coverage data format to c8's format

  Examples:

    Install:           # install d8:
                       deno install --allow-write --allow-read -n d8 https://nest.land/d8

    Report:
                       # collect deno coverage
                       deno test --coverage=coverage/deno

                       # convert to c8 format
                       d8 convert coverage/deno coverage/tmp

                       # generate reports with c8
                       npx c8 report -r html

    Report & Coverage:
                       # collect deno coverage
                       deno test --coverage=coverage/deno

                       # convert to c8 format
                       d8 convert coverage/deno coverage/tmp

                       # report & threshold checks
                       npx c8 report -r html --check-coverage --per-file
                       # (see c8 docs for more details)
```

### Why is this not a wrapper for `c8`?

Unfortunately, a `c8` dependency uses an unsupported node.js core API and
prevents this module from being used as deno module.

        ```
            ..  Installing c8 from esm.sh
            error: Import 'https://cdn.esm.sh/error.js?type=unsupported-nodejs-builtin-module&name=module&importer=v8-to-istanbul' failed: 500 Internal Server Error
            error: Uncaught (in promise) this package is invalid or the url is invalid
            ```
