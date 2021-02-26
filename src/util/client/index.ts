import axios from "axios";
import chalk from "chalk";

import { Client, Collection, MessageEmbed } from "discord.js";
import { connect, Db, MongoClient } from "mongodb";

import {loadEvents, loadCommands} from "./module.controller";

import * as Interfaces from '../interfaces';
import * as Methods from '../Methods';
import shortInfos from "../../modules/moderation/short-infos";

export class PreMiD extends Client {
    database: Promise<MongoClient>;
    moduleCount: Number;
    ttCount: Number;
    db: Db;
    
    readonly logger = Methods.createLogger();
    readonly config = require("../../config");

    fetch       = (url: string, options?: object) => axios(url, options).catch(e => console.log(`${chalk.bgMagenta(` AXIOS `)} ${e}`));
    info        = this.logger.info;
    debug       = this.logger.debug;
    error       = this.logger.error;
    success     = this.logger.success;
    infos       = new Collection<any, any>();
    infoAliases = new Collection<any, any>();
    commands    = new Collection<string, Interfaces.Command>();
    aliases     = new Collection<string, Interfaces.Command>();
    events      = new Collection<string, Interfaces.Event>();

    Embed = MessageEmbed;
    
    constructor(options?: Partial<Interfaces.Options>) { 
        super(options); 
        for (let i in shortInfos) {
            this.infos.set(i, shortInfos[i]);
            if (shortInfos[i].aliases) shortInfos[i].aliases.forEach((alias: string) => this.infoAliases.set(alias, i));
        }
    }

    async initDatabase() {
        this.debug("Database... connecting");
		let db = await connect(process.env.MONGO_URI as string, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
        })
        process.stdout.moveCursor(0, -1)
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

        this.info(`Loading modules (${this.moduleCount})`)
        this.info(`Loaded commands (${this.commands.size})`);
		this.info(`Loaded events (${this.events.size})`);

        super.login(token).catch(this.logger.error)

        return token as string;
    }
}