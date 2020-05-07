import * as Discord from "discord.js";
import pm2 from "pm2";

module.exports.run = async (
	message: Discord.Message,
	params: Array<string>
) => {
	message.delete();

	pm2.connect(true, async function (err) {
		if (err) {
			message.reply(`Error connecting to pm2: \`\`\`${err.message}\`\`\``);
			return;
		}
		pm2.list(async (err, processes) => {
			if (err) {
				message.reply(
					`Error listing pm2 processes: \`\`\`${err.message}\`\`\``
				);
				return;
			}

			processes = processes.filter(p => p.pm2_env.pm_cwd.includes("PreMiD"));
			if (params.length === 0) {
				(
					await message.channel.send(
						new Discord.MessageEmbed({
							title: "pm2 - Processes",
							color: "#7289DA",
							fields: processes
								.filter((p, i) => processes.indexOf(p) === i)
								.map(p => {
									return {
										name: `${p.name} - ${
											p.pm2_env.status.slice(0, 1).toUpperCase() +
											p.pm2_env.status.slice(1, p.pm2_env.status.length)
										}`,
										value: `**CPU:** \`${
											p.monit.cpu
										}%\` | **RAM:** \`${Math.floor(
											p.monit.memory / 1024 / 1024
										)}mb\``
									};
								})
						})
					)
				).delete({ timeout: 15 * 1000 });
				pm2.disconnect();
			} else {
				const processToRestart = processes.find(
					p => p.name === params.join(" ")
				);
				if (processToRestart) {
					pm2.reload(params.join(" "), async (err, p) => {
						if (err) {
							message.reply(
								`Error reloading process: \`\`\`${err.message}\`\`\``
							);
							return;
						}

						(await message.reply("Successfully reloaded process.")).delete({
							timeout: 5 * 1000
						});
						pm2.disconnect();
					});
				}
			}
		});
	});
};

module.exports.config = {
	name: "pm2",
	description: "Execute pm2 commands.",
	permLevel: 4
};
