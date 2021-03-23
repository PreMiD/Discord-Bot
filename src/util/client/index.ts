import axios from "axios";
import chalk from "chalk";
import { Client, Collection, MessageEmbed } from "discord.js";
import { connect, Db, MongoClient } from "mongodb";

import { logger } from "../..";
import shortInfos from "../../modules/moderation/short-infos";
import * as Interfaces from "../interfaces";
import * as Methods from "../Methods";
import { loadCommands, loadEvents } from "./module.controller";

export class PreMiD extends Client {
    database: Promise<MongoClient>;
    moduleCount: number;
    ttCount: number;
    db: Db;
    
    readonly config = require("../../config").default;

    fetch = (url: string, options?: object) =>
        axios(url, options).catch(e => console.log(`${chalk.bgMagenta(` AXIOS `)} ${e}`));
    
    info = logger.extend("info");
    debug = logger.extend("debug");
    error = logger.extend("error");
    success = logger.extend("success");

    infoAliases = new Collection<string, string>();
    commands = new Collection<string, Interfaces.Command>();
    aliases = new Collection<string, Interfaces.Command>();
    events = new Collection<string, Interfaces.Event>();
    infos = new Collection<string, Interfaces.ShortInfo>();

    Embed = MessageEmbed;
    
    constructor(options?: Partial<Interfaces.Options>) { 
        super(options); 
        for (const i in shortInfos) {
            this.infos.set(i, shortInfos[i]);
            if (shortInfos[i].aliases) shortInfos[i].aliases.forEach((alias: string) => this.infoAliases.set(alias, i));
        }
    }

    async initDatabase() {
        this.debug("Database... connecting");
		const db = await connect(process.env.MONGO_URI as string, {
			useUnifiedTopology: true,
			useNewUrlParser: true
        });
        process.stdout.moveCursor(0, -1);
        process.stdout.clearLine(1);
		this.success("Database... connected");
        return db;
    }

    loadExtra() {
        Object.keys(Methods).forEach(key =>
            this[key] = Methods[key]
        );
    }

    async login(token = process.env.TOKEN) {
        this.db = (await this.initDatabase()).db(process.env.DB);
        
        this.loadExtra();

        await loadCommands(this);
        await loadEvents(this);

        this.info(`Loading modules (${this.moduleCount})`);
        this.info(`Loaded commands (${this.commands.size})`);
		this.info(`Loaded events (${this.events.size})`);

        super.login(token).catch(this.error);

        return token as string;
    }
}