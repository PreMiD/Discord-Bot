import { InteractionResponse } from "../../../../@types/djs-extender";
import config from "../../../config";
import activity from "../../moderation/commands/activity";
import { Ticket } from "../classes/Ticket";

module.exports.run = async (res: InteractionResponse, perms: number) => {
	switch (res.data.options[0].name) {
		case "activity":
			return activity(res, perms);
		case "close": {
			let t = new Ticket(),
				ticketFound: boolean;

			if (res.channel.parent.id === config.supportCategory)
				ticketFound = await t.fetch("channel", res.channel.id);
			else ticketFound = await t.fetch("author", res.member.id);

			if (!ticketFound) {
				if (res.channel.parent.id !== config.supportCategory) {
					return (
						await res.channel.send(
							`${res.member.toString()}, you don't have any open tickets.`
						)
					).delete({ timeout: 10 * 1000 });
				} else return;
			}

			return await t.close(
				res.member.user,
				(res.data.options[0]?.options?.[0].value as string) || "Not Specified"
			);
		}
	}
};

module.exports.config = {
	name: "ticket",
	discordCommand: true
};
