import {Client, Message, ClientOptions} from "discord.js";

interface Options extends ClientOptions {
    token?: string;
    debug: boolean;
    _apiPort: number;
}
interface Command {
    config: {
        name: string;
        aliases: string[];
        description: string;
        slashCommand?: boolean;
        hidden?: boolean;
        permLevel?: number;
    }
    run(client: Client, message: Message, aliases: string[]): void;
}

interface Event {
    name: string;
    type: "process" | "client";
    run(client: Client, ...args: unknown[]): void;
}

interface ShortInfo {
    title: string;
	aliases: string[];
	description: string;
	color: string;
	footer: boolean;
}

export{Event, Command, Options, ShortInfo};