import chalk from "chalk";
export const createLogger = () => new class Logger {
	info = (message: String) => console.log(`${chalk.bgBlue("  ")} ${message}`);
	debug = (message: String) => console.log(`${chalk.bgRedBright("  ")} ${message}`);
	error = (message: String)  => console.log(`${chalk.bgRed("  ")} ${message}`);
	success = (message: String) => console.log(`${chalk.bgGreen("  ")} ${message}`);
}

export const elevation = async(client, userId) => {
    enum PermLevel {
        DEFAULT = 0,
        SUPPORT = 1,
        JRMODERATOR = 3,
        MODERATOR = 3,
        ADMIN = 4,
        DEVELOPER = 5
    }

    let permlvl: Number = 0,
		roles = client.config.roles,
		member = client.guilds.resolve(client.config.main_guild).members.resolve(userId) || (await client.guilds.resolve(client.config.main_guild).members.fetch(userId));

	if (!member) return PermLevel.DEFAULT;

	const memberRoles = member.roles.cache;

	if (memberRoles.has(roles.ticketManager)) permlvl = PermLevel.SUPPORT;
	if (memberRoles.has(roles.jrModerator)) permlvl = PermLevel.JRMODERATOR;
	if (memberRoles.has(roles.moderator)) permlvl = PermLevel.MODERATOR;
	if (memberRoles.has(roles.administrator) || member.permissions.has("ADMINISTRATOR")) permlvl = PermLevel.ADMIN;
	if (memberRoles.has(roles.developer)) permlvl = PermLevel.DEVELOPER;

	return permlvl;
}