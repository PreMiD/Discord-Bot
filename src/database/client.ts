import { MongoClient as mongoClient, Db } from "mongodb";

export let MongoClient: mongoClient;
export let pmdDB: Db;

export function connect() {
	return new Promise<mongoClient>((resolve, reject) => {
		mongoClient
			.connect(
				`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${process.env.MONGOIP}:${27017}`,
				{
					useUnifiedTopology: true,
					useNewUrlParser: true,
					appname: "PreMiD Discord-Bot"
				}
			)
			.then(mongoClient => {
				MongoClient = mongoClient;
				pmdDB = MongoClient.db(process.env.NODE_ENV === 'production' ? 'PreMiD' : 'PreMiD-DEV');
				resolve(mongoClient);
			})
			.catch(reject);
	});
}
