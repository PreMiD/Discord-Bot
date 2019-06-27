//* Import stuff
import * as mysql from "mysql2/promise";
import { success, error } from "../util/debug";

var db, connection: mysql.Connection;

function connectDb() {
  if (typeof connection == "undefined") {
    return new Promise<mysql.Connection>(function(resolve, reject) {
      //! localhost -> premid.app if development instance
      db = mysql.createConnection({
        host: process.env.NODE_ENV == "dev" ? process.env.DBHOST : "localhost",
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DBDATABASE,
        charset: "utf8mb4"
      });

      //* Output info and resolve promise when connected
      db.then(function(conn: mysql.Connection) {
        connection = conn;
        success("Connected to database!");
        resolve(connection);
        connection = conn;
      });

      db.catch(function(err: Error) {
        error(`Connection to database failed: ${err.message}`);
        reject(err);
        process.exit(1);
      });
    });
  } else return connection;
}

export { connection as db, connectDb };
