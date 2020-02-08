import { client } from "../..";
import { MongoClient } from "../../database/client";
import roles from "../../roles";

let coll = MongoClient.db("PreMiD").collection("betaAccess");

async function updateBetaAccess() {
	let betaUser = (
		await client.guilds.get("493130730549805057").members.fetch({ limit: 0 })
	).filter(m => m.roles.has(roles.patron) || m.roles.has(roles.booster));

	betaUser.map(async bU => {
		if (!bU.roles.has(roles.beta)) bU.roles.add(roles.beta);
		if (!(await coll.findOne({ userId: bU.id })))
			coll.insertOne({ userId: bU.id });
	});
}

updateBetaAccess();
