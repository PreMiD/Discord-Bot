import { MongoClient as mongoClient } from "mongodb";

export let MongoClient: mongoClient;

export function connect() {
  return new Promise<mongoClient>((resolve, reject) => {
    mongoClient
      .connect(
        `mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@${
          process.env.MONGOIP
        }:${27017}`,
        {
          useNewUrlParser: true,
          autoReconnect: true,
          appname: "PreMiD Discord Bot"
        }
      )
      .then(mongoClient => {
        MongoClient = mongoClient;
        resolve(mongoClient);
      })
      .catch(reject);
  });
}
