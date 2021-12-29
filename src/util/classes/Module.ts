import debug from "debug";
import { Client } from "discord.js";
import { resolve } from "node:path";

import { mainLog } from "../..";
import ModuleLoader from "./ModuleLoader";

export interface ModuleOptions {
	path: string;
	name: string;
}

export default class Module {
	initialized: Promise<void>;
	log: debug.Debugger;

	constructor(public moduleLoader: ModuleLoader, public client: Client, public options: ModuleOptions) {
		this.moduleLoader.modules.push(this);

		this.log = mainLog.extend(`Module`).extend(options.name);
		this.initialized = this.init();
	}

	async init() {
		this.log("Loading commands...");
		await this.moduleLoader.loadCommands(resolve(`${this.options.path}/commands`));

		try {
			this.log("Running index script...");
			const index = await import(resolve(this.options.path, "index.js"));
			await index?.default();
			this.log("Ran index script");
		} catch (err) {}

		this.log("Loading events...");
		await this.moduleLoader.loadEvents(resolve(`${this.options.path}/events`));
	}
}
