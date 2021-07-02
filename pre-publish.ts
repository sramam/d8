import { parse as yamlParse } from "https://deno.land/std@0.100.0/encoding/yaml.ts";
import Metadata from "./metadata.ts";

const decoder = new TextDecoder("utf-8");

const { name, install, version } = Metadata;

async function updateReadmeMd(filename = "./README.md") {
  const markdown = decoder.decode(await Deno.readFile(filename));
  const verRegExp = new RegExp(`${name}@\d+.\d+.\d+`, "gi");
  markdown
    .split("\n")
    .map((line) => line.replace(verRegExp, `${name}@${version}`))
    .join("\n");
  await Deno.writeTextFile(filename, markdown);
}

async function updateEggsYml(filename = "./egg.yml") {


}

async function main() {
  await updateReadmeMd();
  await updateEggsYml();
}

await main();
