"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//* Import stuff
const mysql = require("mysql2/promise");
var { success, error } = require("../util/debug"), db, connection;
exports.db = connection;
function connectDb() {
    //@ts-ignore
    if (typeof connection == "undefined") {
        return new Promise(function (resolve, reject) {
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
            db.then(function (conn) {
                exports.db = connection = conn;
                success("Connected to PreMiD database!");
                resolve(connection);
                exports.db = connection = conn;
            });
            // @ts-ignore
            db.catch(function (err) {
                console.log(err);
                error("Failed to connect to database");
                process.exit(1);
            });
        });
    }
    else
        return connection;
}
exports.connectDb = connectDb;
