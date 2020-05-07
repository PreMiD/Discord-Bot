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
		pm2.list((err, processes) => {
			if (err) {
				message.reply(
					`Error listing pm2 processes: \`\`\`${err.message}\`\`\``
				);
				return;
			}

			processes = processes.filter(p => p.pm2_env.pm_cwd.includes("PreMiD"));
			if (params.length === 0) {
				message.channel.send(
					new Discord.MessageEmbed({
						title: "pm2 - Processes",
						color: "#7289DA",
						fields: processes.map(p => {
							return {
								name: `${p.name} - ${p.pm2_env.status}`,
								value: `**CPU:** \`${p.monit.cpu}%\` | **RAM:** \`${Math.floor(
									p.monit.memory / 1024 / 1024
								)}mb\``
							};
						})
					})
				);
				pm2.disconnect();
			} else {
				const processToRestart = processes.find(
					p => p.name === params.join(" ")
				);
				if (processToRestart) {
					pm2.reload(params.join(" "), (err, p) => {
						if (err) {
							message.reply(
								`Error reloading process: \`\`\`${err.message}\`\`\``
							);
							return;
						}

						message.reply("Successfully reloaded process.");
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
