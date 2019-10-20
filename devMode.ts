import * as ts from "typescript";
import chalk from "chalk";
import { ChildProcess, fork } from "child_process";
import { removeSync, writeFileSync, copySync } from "fs-extra";
import { extname } from "path";
import * as glob from "fast-glob";
import { createInterface } from "readline";

//* Current child process = null
let currChild: ChildProcess = null;

//* Format Host
const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

//* Create ts program
const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

//* Create Watch compoile host
const host = ts.createWatchCompilerHost(
  "./tsconfig.json",
  {},
  ts.sys,
  createProgram,
  null,
  fileChange
);

if (process.argv.length == 3 && process.argv[2] == "compile")
  prepareDist().then(() => process.exit());
//* Create watch program
else {
  let rl = createInterface({ input: process.stdin });
  rl.on("line", input => {
    if (input === "rs") {
      console.log(chalk.yellowBright("Restarting process..."));
      compile();
    }
  });
  ts.createWatchProgram(host);
}

async function fileChange(diagnostic: ts.Diagnostic) {
  if (currChild && !currChild.killed) currChild.kill();

  //* TS compilation != done
  if (diagnostic.code !== 6194) {
    //* If error
    if ([6031, 6032].includes(diagnostic.code)) {
      console.clear();

      console.log(
        chalk.blueBright(ts.formatDiagnostic(diagnostic, formatHost))
      );
    } else
      console.log(chalk.redBright(ts.formatDiagnostic(diagnostic, formatHost)));
    return;
  } else
    console.log(chalk.greenBright(ts.formatDiagnostic(diagnostic, formatHost)));
  compile();
}

function compile() {
  //* Kill old child if exists && alive
  if (currChild && !currChild.killed) currChild.kill();

  //* Run devMode script
  prepareDist();

  //* Run child
  currChild = fork("index.js", [], { cwd: "dist" });
}

//* Prepare dist folder
async function prepareDist() {
  //* Select files
  let dist = await glob("dist/**/*", { onlyFiles: true }),
    src = await glob("src/**/*", { onlyFiles: true });

  //* Filter file differences
  let nDist = dist.map(f => [f.replace("dist/", ""), f]);
  src = src
    .map(f => f.replace("src/", "").split(".")[0])
    .filter(sf => nDist.find(d => d[0].split(".")[0] == sf));

  //* Old files, delete
  Promise.all(
    dist
      .filter(f => !src.includes(f.replace("dist/", "").split(".")[0]))
      .map(f => removeSync(f))
  );

  //* Copy package.json (minified)
  let packageJSON = require("./package.json"),
    srcPackageJSON = packageJSON;

  //* Write file
  await writeFileSync(
    "./src/package.json",
    JSON.stringify(srcPackageJSON, null, 2)
  );

  //* Copy files from src to dist
  copySync("src", "dist", {
    filter: function(path) {
      if (path.includes("/node_modules")) return false;
      return extname(path) !== ".ts";
    }
  });
}
