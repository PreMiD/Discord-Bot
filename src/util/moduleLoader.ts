import Discord from "discord.js";
import fs from "fs";
import path from "path";
import shortInfos from "../modules/moderation/short-infos";
import { error, info } from "../util/debug";

let moduleFolder: fs.PathLike = path.resolve("./modules");

export default async (client: Discord.Client) => {
  loadModules(client);
  //* Load global events
  loadEvents(path.resolve(`./events`), client);
};

/**
 * Load modules in the modules folder
 * @param {client} client
 */
async function loadModules(client: Discord.Client) {
  let modules = fs.readdirSync(moduleFolder);

  modules = modules.filter((module) => {
    if (
      fs.existsSync(`${moduleFolder}/${module}/config.json`) &&
      typeof require(`${moduleFolder}/${module}/config.json`).enabled !=
        "undefined"
    )
      return require(`${moduleFolder}/${module}/config.json`).enabled;
    else return true;
  });

  let commandCount = await Promise.all(
    modules.map(async (module) => {
      if (fs.existsSync(`${moduleFolder}/${module}/commands`))
        return fs
          .readdirSync(`${moduleFolder}/${module}/commands`)
          .filter((f) => {
            if (f.endsWith(".ts") || f.endsWith(".map")) return false;
            let props = require(`${moduleFolder}/${module}/commands/${f}`);
            if (typeof props["config"].enabled == "undefined") return true;
            else props["config"].enabled;
          });
    })
  ).then((cmds) => {
    // @ts-ignore
    return [].concat(...cmds).filter((f) => f).length;
  });

  let eventCount = await Promise.all(
    modules.map(async (module) => {
      if (fs.existsSync(`${moduleFolder}/${module}/events`))
        return fs
          .readdirSync(`${moduleFolder}/${module}/events`)
          .filter((f) => {
            if (f.endsWith(".ts") || f.endsWith(".map")) return false;
            let props = require(`${moduleFolder}/${module}/events/${f}`);
            if (
              typeof props == "function" ||
              typeof props.config != "undefined"
            )
              return true;
            else return false;
          });
    })
  ).then((events) => {
    // @ts-ignore
    return [].concat(...events).filter((f) => f).length;
  });

  info(
    `${modules.length} module${
      modules.length == 1 ? "" : "s"
    } | ${commandCount} command${
      commandCount == 1 ? "" : "s"
    } | ${eventCount} event${eventCount == 1 ? "" : "s"}`
  );

  modules.map(async (module) => {
    if (fs.existsSync(`${moduleFolder}/${module}/commands`))
      loadCommands(`${moduleFolder}/${module}/commands`, client);
    if (fs.existsSync(`${moduleFolder}/${module}/events`))
      loadEvents(`${moduleFolder}/${module}/events`, client);

    client.once("ready", async () => {
      if (fs.existsSync(`${moduleFolder}/${module}/index.js`))
        require(`${moduleFolder}/${module}/index.js`);
    });
  });

  for (let i in shortInfos) {
    client.infos.list.set(i, shortInfos[i]);

    if (shortInfos[i].aliases)
      shortInfos[i].aliases.forEach((alias: string) => {
        client.infos.aliases.set(alias, i);
      });
  }
}

/**
 * Load all commands in the given folder
 * @param {string} filePath Path to folder with command files
 * @param {client} client Client which will be used to save the command
 */
async function loadCommands(filePath: string, client: Discord.Client) {
  let files = fs.readdirSync(filePath);

  files = files.filter((file) => !file.endsWith(".ts"));
  files = files.map((file) => file.split(".")[0]);

  files.map((command) => {
    let props = require(`${filePath}/${command}`);
    if (typeof props["config"] == "undefined") {
      error(
        `Command ${command} in module ${path.basename(
          path.dirname(filePath)
        )} is missing required field config`
      );
      return;
    }

    if (typeof props.config.name == "undefined") {
      error(
        `Command ${command} in module ${path.basename(
          path.dirname(filePath)
        )} is missing required property name`
      );
      return;
    }

    if (typeof props.config.enabled != "undefined" && !props.config.enabled)
      return;

    client.commands.set(props.config.name, props);
    //* Only add aliases if there are any
    if (typeof props.config.aliases != "undefined")
      props.config.aliases.forEach((alias: string) => {
        client.aliases.set(alias, props.config.name);
      });
  });
}

/**
 * Load all events in the given folder
 * @param {string} filePath Path to folder with event files
 * @param {client} client Client which will be used to bind the event
 */
async function loadEvents(filePath: string, client: Discord.Client) {
  let eventFile: any,
    files = fs.readdirSync(filePath);

  files = files.filter(
    (file) => !file.endsWith(".ts") && !file.endsWith(".map")
  );
  files = files.map((file) => file.split(".")[0]);

  files.map((event: any) => {
    eventFile = require(`${filePath}/${event}.js`);
    if (typeof eventFile == "function") client.on(event, eventFile);
    else {
      if (typeof eventFile.config == "undefined") {
        error(
          `Event ${event} in module ${path.basename(
            path.dirname(filePath)
          )} is missing required field config`
        );
        return;
      }

      if (typeof eventFile.config.clientOnly != "undefined")
        client.on(event, () => eventFile.run(client));
    }
  });
}
