"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { success } = require("../util/debug");
module.exports.run = (client) => {
    if (client.user)
        success(`Connected to Discord as ${client.user.tag}`);
};
module.exports.config = {
    clientOnly: true
};
