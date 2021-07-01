import { walk, ensureDir, emptyDir, exists } from "./deps.ts";

export interface Args {
  denoDir: string;
  c8Dir: string;
  clean?: boolean;
  trace?: boolean;
}

const Debug = (trace: boolean) => (msg: string) => {
  if (trace) console.log(msg);
};

let debug: (msg: string) => void;

/**
 * Converts deno coverage output to a form that `c8` can pickup and further
 * translate to a form that istanbul reports can work upon.
 *
 * Expects a denoOutputDir and istanbulInputDir.
 * Will optionally clean istanbulInputDir if requested.
 */
export default async function d8({ denoDir, c8Dir, clean, trace }: Args) {
  await ensureDir(denoDir);
  if (clean) {
    await emptyDir(c8Dir);
  } else {
    await ensureDir(c8Dir);
  }
  debug = Debug(!!trace);
  const collation = await collate(denoDir);
  // it's possible that this run of tests only factors in a partial set of test cases
  // in which case, we might want to append the coverage data to what is already in place.
  //
  const collectorFile = `${c8Dir}/coverage.${Deno.pid}.json`;
  await Deno.writeTextFile(collectorFile, JSON.stringify(collation));

  return { denoDir, collectorFile, c8Dir };
}

/**
 * Collates the individual deno coverage reports, filtering out remote urls.
 * Any additional filtering (tests, and the like) is left upto the reporting tools like c8.
 */
async function collate(
  istanbulInputDir: string,
  collation: { result: unknown[] } = { result: [] }
) {
  for await (const entry of walk(istanbulInputDir, { includeDirs: false })) {
    const raw = await Deno.readTextFile(entry.path);
    const v8Coverage = JSON.parse(raw);
    if (v8Coverage?.url.match(/^file.*/)) {
      // The coverage output still contains urls like:
      //  - file:///[SOME PATH]/d8/.tmp/iso-git/__anonymous__
      //  - file:///[SOME PATH]/d8/.tmp/iso-git/$deno$test.js
      // As a simple hack, we check for existence before collating the data
      const fPath = v8Coverage.url.replace("file:///", "");
      if (await exists(fPath)) {
        debug(fPath);
        collation.result.push(v8Coverage);
      }
    }
  }
  return collation;
}
