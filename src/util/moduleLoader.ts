const { info, error } = require("../util/debug");
import * as fs from "fs";
import * as path from "path";
var moduleFolder: fs.PathLike = path.resolve("./modules");
import * as Discord from "discord.js";

module.exports = async (client: Discord.Client) => {
  loadModules(client);
  //* Load global events
  loadEvents(path.resolve(`./events`), client);
};

/**
 * Load modules in the modules folder
 * @param {client} client
 */
async function loadModules(client: Discord.Client) {
  var files = await fs.readdirSync(moduleFolder);

  info(`Loading ${files.length} module${files.length == 1 ? "" : "s"}`);

  files.map(async module => {
    if (await fs.existsSync(`${moduleFolder}/${module}/commands`))
      loadCommands(`${moduleFolder}/${module}/commands`, client);
    if (await fs.existsSync(`${moduleFolder}/${module}/events`))
      loadEvents(`${moduleFolder}/${module}/events`, client);

    client.once("ready", async () => {
      if (await fs.existsSync(`${moduleFolder}/${module}/index.js`))
        require(`${moduleFolder}/${module}/index.js`);
    });
  });
}

/**
 * Load all commands in the given folder
 * @param {String} filePath Path to folder with command files
 * @param {client} client Client which will be used to save the command
 */
async function loadCommands(filePath: any, client: Discord.Client) {
  var files = await fs.readdirSync(filePath);

  info(
    `Loading ${files.length} command${
      files.length == 1 ? "" : "s"
    } in ${path.basename(path.dirname(filePath))}`
  );

  files = files.filter(file => !file.endsWith(".ts"));
  files = files.map(file => file.split(".")[0]);

  files.map(command => {
    var props = require(`${filePath}/${command}`);
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
      props.config.aliases.forEach((alias: String) => {
        client.aliases.set(alias, props.config.name);
      });
  });
}

/**
 * Load all events in the given folder
 * @param {String} filePath Path to folder with event files
 * @param {client} client Client which will be used to bind the event
 */
async function loadEvents(filePath: any, client: Discord.Client) {
  var eventFile: any,
    files = await fs.readdirSync(filePath);

  info(
    `Loading ${files.length} event${
      files.length == 1 ? "" : "s"
    } in ${path.basename(path.dirname(filePath))}`
  );
  files = files.filter(file => !file.endsWith(".ts"));
  files = files.map(file => file.split(".")[0]);

  files.map(event => {
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
