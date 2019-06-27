import { copySync, removeSync } from "fs-extra";
import { extname, basename } from "path";
import * as glob from "fast-glob";

(async () => {
  var dist = await glob("dist/**/*", { onlyFiles: true }),
    src = await glob("src/**/*", { onlyFiles: true });

  //* Delete js files in dist that are no longer existant in src folder
  await Promise.all(
    dist
      .map(f => [
        f.replace("dist/", "").replace(basename(f), basename(f, ".js")),
        f
      ])
      .filter(
        d =>
          !src
            .map(f =>
              f.replace("src/", "").replace(basename(f), basename(f, ".ts"))
            )
            .includes(d[0])
      )
      .map(f => removeSync(f[1]))
  );

  //* Copy files from src to dist
  copySync("src", "dist", {
    filter: function(path) {
      return extname(path) !== ".ts";
    }
  });
})();
