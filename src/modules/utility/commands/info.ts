import { DiscordCommand } from "discord-module-loader";
import {
	ColorResolvable,
	InteractionReplyOptions,
	ButtonBuilder,
	APIButtonComponent,
	EmbedBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ApplicationCommandOptionType
} from "discord.js";

export default new DiscordCommand({
	command: {
		name: "info",
		description: "Posts an information message.",
		options: [
			{
				name: "query",
				description: "The infomation message to search for",
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
				required: true
			},
			{
				name: "user",
				description: "User to mention",
				type: 6
			}
		]
	},
	execute: async int => {
		if (int.isAutocomplete()) {
			const query = int.options.getString("query") || "",
				results = Object.keys(shortInfos)
					.filter(s => s.toLowerCase().includes(query.toLowerCase()))
					.slice(0, 25);

			return await int.respond(results.map(s => ({ name: shortInfos[s].title, value: s })));
		}

		//@ts-ignore
		const info = Object.values(shortInfos).find((_, i) => Object.keys(shortInfos)[i] === int.options.getString("query")!)!,
			embed = new EmbedBuilder({
				title: `${info.emoji || "🔖"} ${info.title}`,
				description: info.description
			});

		embed.setColor(info.color ?? "Blurple");

		let response: InteractionReplyOptions = { embeds: [embed] };

		if (info.image) embed.setImage(info.image);
		if (info.links) {
			const actionRow = new ActionRowBuilder();

			for (const link of info.links)
				actionRow.addComponents(
					new ButtonBuilder({
						style: ButtonStyle.Link,
						...link
					})
				);

			//@ts-ignore
			response.components = [actionRow];
		}

		//@ts-ignore
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
		links?: Partial<APIButtonComponent>[];
	};
} = {
	troubleshooting: {
		title: "Troubleshooting",
		emoji: "❓",
		description:
			"If you have problems with PreMiD, you should read our troubleshooting guide and if that doesn't help, create a new post in <#1019726199494279248>.",

		links: [
			{
				label: "Troubleshooting Guide",
				url: "https://docs.premid.app/troubleshooting"
			}
		]
	},
	modifiedClients: {
		title: "Modified Clients",
		color: "#FF5050",
		description:
			"Using a modified client is an violation of Discord's ToS and therefore you run the risk of losing your account. If you want to keep using Discord, you have to follow them and make sure you're not breaking any of the rules Discord. Even using modified clients for theming or other customizations are against Discord's ToS. If you don't believe us, read it yourself.",
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
		title: "Creating a Presence",
		emoji: "🏗",
		description:
			"If you wish to add support for a service that does not have a Presence yet, you can either open an issue on GitHub to request the presence to be created or you create it yourself. If you wish to create a Presence for PreMiD you need to have basic knowledge of TypeScript. For more information and docs on how to create a Presence follow our documentation.",
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
		title: "Read the Docs",
		description:
			"If you have any questions regarding PreMiD, please read our documentation before creating a ticket. Presence development related queries should be redirected to <#1019727742335463474>",
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
		title: "Presence Store",
		emoji: "🏪",
		description: "Press the button below to visit our Presence Store full of the your favourite services!",
		links: [{ label: "Presence Store", url: "https://premid.app/store" }]
	},
	downloadPreMiD: {
		title: "Download PreMiD",
		emoji: "📦",
		description:
			"You can download PreMiD and its extension for your browser, but don't forget that **you need both application and extension** to get PreMiD to work.\n :warning: PreMiD does not support the web version of Discord, you **must** use the desktop version of Discord.",
		links: [{ label: "Downloads", url: "https://premid.app/downloads" }]
	},
	donate: {
		title: "Donate",
		emoji: "💵",
		description:
			"Want to support PreMiD's development? Great! You can do so by boosting our Discord server, which you will get a special role, or you can support us on Patreon!",
		links: [
			{ label: "Patreon", url: "https://patreon.com/Timeraa" },
			{ label: "GitHub Sponsors", url: "https://github.com/sponsors/Timeraa" }
		]
	},
	creatingATicket: {
		title: "Creating a Support Ticket",
		emoji: "🙋",
		description:
			"Recently, we have migrated to use Discord's new forum channels for our support system. You can now create a ticket by creating a new post in <#1019726199494279248>"
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
		title: "Allow apps from unidentified developers (macOS)",
		description:
			"Steps for **macOS Big Sur (11.0+)**:\n1. Right click on our installer.\n2. Click `Open` in the dropdown menu.\n3. Click `Open` in popup.\n\nSteps for **older macOS versions**:\n1. Open System Preferences.\n2. Go to the Security & Privacy tab.\n3. Click on the lock and enter your password or scan your fingerprint so you can make changes.\n4. Change the setting for 'Allow apps downloaded from' to 'App Store and identified developers' from just 'App Store'."
	},
	reportingaPresenceBug: {
		title: "Reporting a Presence bug",
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
	adblockDetection: {
		title: "Adblock Detection",
		emoji: "🚫",
		description:
			'If our website has falsely detected the presence of an ad-blocker, you can simply press "I don\'t want to support" six times and you will be redirected to the download. Alternatively, you can find direct download links below.',
		links: [
			{
				label: "Download Links",
				url: "https://discord.com/channels/493130730549805057/527675240231206934/715852870062309386"
			}
		]
	},
	requestANewFeature: {
		title: "Requesting a Presence feature",
		emoji: "🗳",
		description:
			"Does a presence you use not support a crucial page or not support all the possible domains for the website? If you believe a presence should include more features, you should open an issue on the Presence Repository using the Feature Request template.",
		links: [
			{
				label: "Template",
				url: "https://github.com/PreMiD/Presences/issues/new?assignees=&labels=Feature+Request&template=feature_request.yml"
			}
		]
	},
	beta: {
		title: "Premid Beta",
		emoji: "✨",
		description:
			"Do you want cool new features? Want to use premid with the browser version of discord? Download the beta!",
		links: [
			{
				label: "Betab Release Page",
				url: "https://premid.app/beta"
			}
		]
	},
	frequentFixes: {
		title: "Frequent fixes for Presence bugs",
		emoji: "🗳",
		description:
			"There are some frequent fixes for presences, use the buttons to navigate to these.\n If this doesn't work, please submit your issue to <#1019726199494279248>",
		links: [
			{
				label: "YouTube/Netflix",
				url: "https://discord.com/channels/493130730549805057/527675240231206934/831995042469642251"
			},
			{
				label: "YouTube",
				url: "https://discord.com/channels/493130730549805057/527675240231206934/827037909504753704"
			},
			{
				label: "General fix",
				url: "https://discord.com/channels/493130730549805057/527675240231206934/723231955893747763"
			}
		]
	}
};
