import debug from "debug";
import env from "dotenv";

import { PreMiD } from "./util/client";

env.config();
debug.enable(process.env.DEBUG);
export const logger = debug("Discord-Bot");

const client = new PreMiD({
		token: process.env.TOKEN
	}),  
	db = client.db;

client.login();

export {client, db};
