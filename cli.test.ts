import { fs, git, http } from "https://x.nest.land/iso-git@0.1.6/mod.ts";
import { emptyDir } from "./deps.ts";

Deno.test(`coverage report generation`, async () => {
  const url = `https://github.com/sramam/iso-git`;
  const moduleName = url.split("/").pop();
  const dir = `${Deno.cwd()}/.tmp/${moduleName}`;

  console.log("\n");
  console.log(`starting ${moduleName} coverage test`);
  // 1. Clone the repo
  await emptyDir(dir);
  await git.clone({
    fs,
    http,
    dir,
    url,
  });
  console.log(`Successfully cloned repo ${url}`);

  // 2. Run the tests
  await runCmd(
    "deno test -A --unstable --coverage=coverage/deno",
    dir,
    `${moduleName} tests`,
  );

  // 3. Convert the deno output
  const denoDir = `.tmp/${moduleName}/coverage/deno`;
  const c8Dir = `.tmp/${moduleName}/coverage/tmp`;
  const cmd =
    `deno run --allow-read --allow-write --unstable cli.ts convert ${denoDir} ${c8Dir}`;
  await runCmd(cmd, Deno.cwd(), "d8 covert");

  // 4. Generate reports
  await runCmd(`npx c8 report -r html`, dir, `generate report`);
});

async function runCmd(command: string, cwd: string, msg: string = command) {
  const sh = resolveShell();
  const prefix = Deno.build.os === "windows" ? "/C" : "-c";
  const cmd = [sh, prefix, command];
  const runner = await Deno.run({
    cmd,
    cwd,
    stdout: "piped",
    stderr: "piped",
  });
  if ((await runner.status()).code) {
    // there was an error
    await Deno.stdout.write(await runner.output());
    await Deno.stderr.write(await runner.stderrOutput());
    runner.stderr.close();
    runner.stdout.close();
    runner.close();
    throw new Error(`Failed to ${msg}. Cannot proceed`);
  } else {
    runner.stderr.close();
    runner.stdout.close();
    runner.close();
    console.log(`Successful on ${msg}`);
  }
}

function resolveShell(): string {
  const shells: string[] = Deno.build.os === "windows"
    ? [
      Deno.env.get("ComSpec") as string,
      `c:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe`,
      `c:/Windows/system32/cmd.exe`,
      `cmd.exe`,
    ]
    : [Deno.env.get("SHELL") as string, "sh"];

  return shells.reduce((sh, curr) => {
    try {
      sh = sh ? sh : Deno.statSync(curr).isFile ? curr : ``;
    } catch {
      // try next shell
    }
    return sh;
  }, ``);
}
