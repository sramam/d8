import d8 from "./mod.ts";
import { colors, Command, parse } from "./deps.ts";
const { gray, italic } = colors;
const data = parse(Deno.readTextFileSync("./egg.yml"));

await new Command()
  .name("d8")
  .version((data as { version: string }).version)
  .description("Adapt deno coverage output to c8/nyc/istanbul reporting")
  .example(
    `Install`,
    [
      gray(italic(`# install d8:`)),
      `deno install --allow-write --allow-read -n d8 https://nest.land/d8`,
      ` `,
    ].join("\n")
  )
  .example(
    `Report`,
    [
      ``,
      gray(italic(`# collect deno coverage`)),
      `deno test --coverage=coverage/deno`,
      ``,
      gray(italic(`# convert to c8 format`)),
      `d8 convert coverage/deno coverage/tmp`,
      ``,
      gray(italic(`# generate reports with c8`)),
      `npx c8 report -r html`,
      ` `,
    ].join(`\n`)
  )
  .example(
    `Report & Coverage`,
    [
      ``,
      gray(italic(`# collect deno coverage`)),
      `deno test --coverage=coverage/deno`,
      ``,
      gray(italic(`# convert to c8 format`)),
      `d8 convert coverage/deno coverage/tmp`,
      ``,
      gray(italic(`# report & threshold checks`)),
      `npx c8 report -r html --check-coverage --per-file`,
      gray(italic(`# (see c8 docs for more details)`)),
      ` `,
    ].join(`\n`)
  )
  .command(
    "convert <deno-dir:string> <c8-dir:string>",
    new Command()
      .description(`convert deno's coverage data format to c8's format`)
      .option(`--clean`, "Clean <c8_dir> before conversion")
      .option(`--trace`, "Provide a trace of execution details", {
        hidden: true,
      })
      .action(async (options, ...args) => {
        const [denoDir, c8Dir] = [...args].map((p: string) =>
          `${Deno.cwd()}/${p}`.replace(/\\+/g, "/")
        );
        const { clean, trace } = options;
        await d8({
          denoDir,
          c8Dir,
          clean,
          trace,
        });
      })
  )
  .parse(Deno.args);
