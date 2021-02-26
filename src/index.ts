import env from "dotenv";;

import { PreMiD } from "./util/client";

env.config();

const client = new PreMiD({
	token: process.env.TOKEN,
})

client.login();

let db = client.db;

export {client, db};