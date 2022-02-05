import { DiscordEvent } from "discord-module-loader";

import updateDiscordUser from "../functions/updateDiscordUser";

export default new DiscordEvent("guildMemberUpdate", async (_, newMember) => {
	await updateDiscordUser(newMember);
});
