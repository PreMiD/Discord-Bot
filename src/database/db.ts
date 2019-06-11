//* Import stuff
import * as mysql from "mysql2/promise";

var { success, error } = require("../util/debug"),
  db,
  connection: mysql.Connection;

function connectDb() {
  //@ts-ignore
  if (typeof connection == "undefined") {
    return new Promise(function(resolve, reject) {
      //! localhost -> premid.app if development instance
      db = mysql.createConnection({
        host: process.env.NODE_ENV == "dev" ? "premid.app" : "localhost",
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DBDATABASE,
        charset: "utf8mb4"
      });

      // @ts-ignore
      //* Output info and resolve promise when connected
      db.then(function(conn) {
        connection = conn;
        success("Connected to PreMiD database!");
        resolve(connection);
        connection = conn;
      });

      // @ts-ignore
      db.catch(function(err: any) {
        console.log(err);
        error("Failed to connect to database");
        process.exit(1);
      });
    });
  } else return connection;
}

export { connection as db, connectDb };
