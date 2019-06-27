"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const glob = require("fast-glob");
(async () => {
    var dist = await glob("dist/**/*", { onlyFiles: true }), src = await glob("src/**/*", { onlyFiles: true });
    //* Delete js files in dist that are no longer existant in src folder
    await Promise.all(dist
        .map(f => [
        f.replace("dist/", "").replace(path_1.basename(f), path_1.basename(f, ".js")),
        f
    ])
        .filter(d => !src
        .map(f => f.replace("src/", "").replace(path_1.basename(f), path_1.basename(f, ".ts")))
        .includes(d[0]))
        .map(f => fs_extra_1.removeSync(f[1])));
    //* Copy files from src to dist
    fs_extra_1.copySync("src", "dist", {
        filter: function (path) {
            return path_1.extname(path) !== ".ts";
        }
    });
})();
