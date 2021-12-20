import {
	AutocompleteInteraction,
	Client,
	Collection,
	CommandInteraction
} from "discord.js";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { basename, dirname, resolve } from "path";

import { client, mainLog } from "../..";
import { ClientCommand } from "../../../@types/djs-extender";
import config from "../../config";
import Module from "./Module";

export default class ModuleLoader {
	private promises: Promise<void>[] = [];
	initialized: Promise<void>;
	modules: Module[] = [];
	log = mainLog.extend("ModuleLoader");

	constructor(public client: Client) {
		this.log("Initializing Modules...");
		this.initialized = this.init();

		client.on("interactionCreate", int => {
			if (!int.isCommand() && !int.isAutocomplete()) return;

			const int1 = int as AutocompleteInteraction | CommandInteraction;

			const cmd = client.commands.get(int1.commandName) as ClientCommand;

			if (!cmd && int1.isCommand())
				return int1.reply({ ephemeral: true, content: "Command not found." });

			cmd.run!(int1);
		});
	}

	async init() {
		if (existsSync(`events`)) this.promises.push(this.loadEvents(`events`));

		if (existsSync("commands"))
			this.promises.push(this.loadCommands(`commands`));

		if (existsSync("modules"))
			this.promises.push(this.loadModules("modules", await readdir("modules")));

		await Promise.all(this.promises);

		await this.updateInteractions(client.commands);
	}

	async loadModules(basePath: string, modules: string[]) {
		const log = this.log.extend(basename(dirname(resolve("..", basePath))));

		log("Loading %d modules...", modules.length);

		for (const module of modules) {
			const m = new Module(this, this.client, {
				name: module,
				path: resolve(`${basePath}/${module}`)
			});
			await m.initialized;
			log("Loaded %s module...", module);
		}
	}

	async loadEvents(basePath: string) {
		if (!existsSync(basePath)) return;

		const log = this.log.extend(basename(dirname(resolve("..", basePath)))),
			events = (await readdir(`${basePath}`)).filter(f => !f.endsWith(".map"));
		log("Loading %d events...", events.length);

		await Promise.all(
			events.map(async event => {
				const module = await import(resolve(`${basePath}/${event}`));

				this.client.on(event.split(".")[0], module.default);
				log("Loaded %s event...", event.split(".")[0]);
			})
		);
	}

	async loadCommands(basePath: string) {
		if (!existsSync(basePath)) return;

		const log = this.log.extend(basename(dirname(resolve("..", basePath)))),
			commands = (await readdir(`${basePath}`)).filter(
				f => !f.endsWith(".map")
			);
		log("Loading %d commands...", commands.length);
		await Promise.all(
			commands.map(async command => {
				const cmd = await import(resolve(`${basePath}/${command}`));

				this.client.commands.set(cmd.config.command.name, {
					command: cmd.config.command,
					permissions: cmd.config.permissions || [],
					run: cmd.default
				});

				log("Loaded %s command.", command.split(".")[0]);
			})
		);
	}

	private async updateInteractions(
		commands: Collection<string, ClientCommand>
	) {
		const pmdGuild = await client.guilds.fetch(config.guildId);

		await client.application!.commands.fetch({ guildId: pmdGuild.id });

		let activeCommands = await pmdGuild.commands.set(
			commands.map(c => c.command)
		);

		this.log("Updating permissions...");
		await pmdGuild.commands.permissions.set({
			fullPermissions: activeCommands.map(c => {
				const perms = commands.find(c1 => c1.command.name === c.name)
					?.permissions;

				return { id: c.id, permissions: perms || [] };
			})
		});

		this.log("Updated permissions.");
	}
}
