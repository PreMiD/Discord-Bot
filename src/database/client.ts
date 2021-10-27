import { Db, MongoClient as mongoClient } from "mongodb";

export let MongoClient: mongoClient;
export let pmdDB: Db;

export function connect() {
	return new Promise<mongoClient>((resolve, reject) => {
		mongoClient
			.connect(process.env.MONGO_URL, {
				appName: "PreMiD Discord-Bot"
			})
			.then(mongoClient => {
				MongoClient = mongoClient;
				pmdDB = MongoClient.db("PreMiD");
				resolve(mongoClient);
			})
			.catch(reject);
	});
}
