import { DiscordCommand } from "discord-module-loader";
import {
	AutocompleteInteraction,
	ColorResolvable,
	CommandInteraction,
	InteractionReplyOptions,
	MessageActionRow,
	MessageButton,
	MessageButtonOptions,
	MessageEmbed
} from "discord.js";

export default new DiscordCommand({
	name: "info",
	description: "Posts an information message.",
	options: [
		{
			name: "query",
			description: "The presence to search for",
			type: "STRING",
			autocomplete: true,
			required: true
		},
		{
			name: "user",
			description: "User to mention",
			type: 6
		}
	],
	execute: async (int: AutocompleteInteraction | CommandInteraction) => {
		if (int.isAutocomplete()) {
			const query = int.options.getString("query") || "",
				results = Object.keys(shortInfos)
					.filter(s => s.toLowerCase().includes(query.toLowerCase()))
					.slice(0, 25);

			return int.respond(results.map(s => ({ name: s, value: s })));
		}

		const info = Object.values(shortInfos).find((_, i) => Object.keys(shortInfos)[i] === int.options.getString("name")!)!,
			embed = new MessageEmbed({
				title: `${info.emoji || "🔖"} ${info.title}`,
				description: info.description,
				color: info.color ?? "BLURPLE"
			});

		let response: InteractionReplyOptions = { embeds: [embed] };

		if (info.image) embed.setImage(info.image);
		if (info.links) {
			const actionRow = new MessageActionRow();

			for (const link of info.links)
				actionRow.components.push(
					new MessageButton({
						//@ts-expect-error
						style: "LINK",
						...link
					})
				);

			response.components = [actionRow];
		}

		if (int.options.getUser("user")) response.content = int.options.getUser("user")!.toString();

		return await int.reply(response);
	}
});

export const shortInfos: {
	[key: string]: {
		title: string;
		description: string;
		emoji?: string;
		image?: string;
		color?: ColorResolvable;
		links?: Partial<MessageButtonOptions>[];
	};
} = {
	troubleshooting: {
		title: "Troubleshooting",
		emoji: "❓",
		description:
			"If you have problems with PreMiD, you can read our troubleshooting guide and if it doesn't solve your problem use our support system by simply writing your concern in <#566738846650335232>.",

		links: [
			{
				label: "Troubleshooting Guide",
				url: "https://docs.premid.app/troubleshooting"
			}
		]
	},
	modifiedClient: {
		title: "Using Modified Clients",
		color: "#FF5050",
		description:
			"Using a modified client is an abuse of Discord's ToS and therefore you run the risk of losing your account. If you want to keep using Discord, you have to follow them and make sure you're not breaking any of the rules Discord has decided to put. Even using modified clients for theming or other customizations are against Discord's ToS. If you don't believe us, read it yourself.",
		links: [
			{
				label: "Discord's ToS",
				url: "https://discordapp.com/terms"
			},
			{
				label: "Discord's Tweet",
				url: "https://twitter.com/discordapp/status/908000828690182145"
			}
		]
	},
	creatingAPresence: {
		title: "Creating a Presence for PreMiD",
		emoji: "🏗",
		description:
			"If you wish to add support for a website that does not have a Presence yet, you can either open an issue on GitHub for it so that others may create it for you or you create it yourself. If you wish to create a Presence for PreMiD you need to have basic knowledge of TypeScript. For more information and docs on how to create a Presence follow our documentation.",
		links: [
			{
				label: "Documentation",
				url: "https://docs.premid.app/dev/presence"
			},
			{
				label: "Service Request",
				url: "https://github.com/PreMiD/Presences/issues/new?assignees=&labels=Service+Request&template=service_request.yml"
			}
		]
	},
	docs: {
		title: "Read the Docs!",
		description:
			"If you have any questions regarding PreMiD, its API, Presence development or how to do ... with PreMiD, please read our documentation before creating a ticket.",
		links: [
			{
				label: "Documentation",
				url: "https://docs.premid.app"
			}
		]
	},
	website: {
		title: "Visit Our Website",
		emoji: "🌐",
		description: "Press the button below to visit our website full of greatness.",
		links: [
			{
				label: "Website",
				url: "https://premid.app"
			}
		]
	},
	presenceStore: {
		title: "PreMiD Presence Store",
		emoji: "🏪",
		description:
			"Since 2.0 we have added our so called Presence Store which is used to add more Presences for more websites other than the default ones added by PreMiD. These Presences are created by our staff or PreMiD's community. You don't have to worry about security/privacy issues tho as our staff reviews every presence added to the store. If you wish to add more Presences to PreMiD visit [our store](https://premid.app/store)! *Oh and btw, its free.*",
		links: [{ label: "Presence Store", url: "https://premid.app/store" }]
	},
	downloadPreMiD: {
		title: "Download PreMiD",
		emoji: "📦",
		description:
			"You can download PreMiD and its extension for your browser, but don't forget that **you need both application and extension** to get PreMiD to work (**NOTE: We do not support the web version of Discord**).",
		links: [{ label: "Downloads", url: "https://premid.app/downloads" }]
	},
	donate: {
		title: "Donate to PreMiD's Development",
		emoji: "💵",
		description:
			"Want to support PreMiD's Development? Great! You can do so by boosting our Discord server, which will get you a special role, or you can support us on Patreon!",
		links: [
			{ label: "Patreon", url: "https://patreon.com/Timeraa" },
			{ label: "GitHub Sponsors", url: "https://github.com/sponsors/Timeraa" }
		]
	},
	creatingATicket: {
		title: "Creating a Proper Support Ticket",
		emoji: "🙋",
		description:
			"We built our own support system which you can use by writing a message into <#566738846650335232>. These tickets are being handled by our support agents/moderators. But please don't abuse this channel by writing nonsense into it.\n\n**You can help us speed up the process of handling your ticket if you provide us with basic information like:**\n• Your problem\n• Your OS (Operating System)\n• Your browser\n• Assets of your problem (images, files, logs...).\n\n**Before you create a ticket make sure to read our documentation as it may already have the answer to your question/problem**"
	},
	suggestingAPresence: {
		title: "Suggesting a Presence",
		emoji: "🗳",
		description:
			"If you'd like to suggest a presence, you can do this on our GitHub repository by creating a new issue with the Service Request template! If want to create a Presence yourself, you can find more information on our documentation",
		links: [
			{
				label: "PreMiD Documentation",
				url: "https://docs.premid.app/dev/presence"
			},
			{
				label: "GitHub Repository",
				url: "https://github.com/PreMiD/Presences"
			},
			{
				label: "Service Request",
				url: "https://github.com/PreMiD/Presences/issues/new?assignees=&labels=Service+Request&template=service_request.yml"
			}
		]
	},
	tos: {
		title: "PreMiD and Discord",
		emoji: "🧬",
		description: "PreMiD is compliant to Discord's ToS and therefore you can use it without any risk of losing your Discord account.",
		links: [
			{
				label: "Proof",
				url: "https://twitter.com/discord/status/1233704070390669312"
			}
		]
	},
	unidentifiedDeveloper: {
		title: "Allow apps from unidentified developers",
		description:
			"Steps for **macOS Big Sur (11.0+)**:\n1. Right click on our installer.\n2. Click `Open` in the dropdown menu.\n3. Click `Open` in popup.\n\nSteps for **older macOS versions**:\n1. Open System Preferences.\n2. Go to the Security & Privacy tab.\n3. Click on the lock and enter your password or scan your fingerprint so you can make changes.\n4. Change the setting for 'Allow apps downloaded from' to 'App Store and identified developers' from just 'App Store'."
	},
	reportingaPresenceRelatedBug: {
		title: "Reporting a Presence Related Bug",
		emoji: "🐛",
		description:
			"If you've found an issue with a presence, it is important that you report your issue on the Presence repository so the bug is resolved within a timely fashion. You can report the bug using the Bug Report template, **ensuring you fill in the template properly**.",
		links: [
			{
				label: "Presence Repository",
				url: "https://github.com/PreMiD/Presences"
			},
			{
				label: "Bug Report",
				url: "https://github.com/PreMiD/Presences/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug_report.yml&title=Service+Name+%7C+Service+URL"
			}
		]
	},
	crowdinStringIssue: {
		title: "Copying string URLs on Crowdin",
		description:
			"When asking a question about a specific string, you should always send its URL. Here's how you can get it:\n**1.** Click on the three dots (...) on the top right of the editor.\n**2.** Select \"**Copy String URL**\".\n\nHere's an image of what the button should look like:",
		image: "https://i.imgur.com/04BtD26.png"
	},
	falseAdblockDetection: {
		title: "False Adblock Detection",
		emoji: "🚫",
		description:
			'If our Website has falsely detected the presence of an ad-blocker, you can simply press "I don\'t want to support" six times and you will be redirected to the download. Alternatively, you can find direct download links below.',
		links: [
			{
				label: "Download Links",
				url: "https://discord.com/channels/493130730549805057/527675240231206934/715852870062309386"
			}
		]
	},
	requestANewFeature: {
		title: "Request a new feature",
		emoji: "🗳",
		description:
			"Does a presence you use not support a crucial page or not support all the possible domains for the website? If you believe a presence should include more features, you should open an issue on the Presence Repository using the Feature Request template.",
		links: [
			{
				label: "Template",
				url: "https://github.com/PreMiD/Presences/issues/new?assignees=&labels=Feature+Request&template=feature_request.yml"
			}
		]
	}
};
