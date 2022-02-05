"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_module_loader_1 = require("discord-module-loader");
const __1 = require("../../..");
exports.default = new discord_module_loader_1.DiscordEvent("guildMemberRemove", async (member) => {
    await __1.pmdDB.collection("credits").deleteOne({ userId: member.id });
});
//# sourceMappingURL=guildMemberRemove.js.map