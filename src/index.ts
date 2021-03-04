import env from "dotenv";
import { PreMiD } from "./util/client";

env.config();

const client = new PreMiD({
		token: process.env.TOKEN
	}),  
	db = client.db;

client.login();

export {client, db};