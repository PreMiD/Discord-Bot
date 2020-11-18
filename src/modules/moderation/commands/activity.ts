import * as Discord from "discord.js";
import { pmdDB } from "../../../database/client";
import path from "path";
import Canvas from "canvas";
import { ChartConfiguration } from "chart.js";
import { CanvasRenderService } from "chartjs-node-canvas";

let creditsColl = pmdDB.collection("credits"),
	ticketsColl = pmdDB.collection("tickets");

interface User {
	userId: string;
	avatar: string;
	name: string;
	tag: string;
	role: string;
	roleId: string;
	roles: string[];
	roleIds: string[];
	roleColor: string;
	rolePosition: string;
	status: string;
	flags: string[];
	premium_since: any;
	tickets?: any[];
	allDates?: any[];
	counts?: any;
}

interface Ticket {
	ticketId: string;
	userId: string;
	ticketMessage: string;
	timestamp: any;
	attachementMessage: string;
	created: any;
	accepter: string;
	status: number;
	supportChannel: string;
	supportEmbed: string;
	supporters: string[];
	lastUserMessage: any;
	messages: any[];
}

module.exports.run = async (
	message: Discord.Message,
	params: string[],
	perms: number
) => {
	message.delete();

	let userActivity: Discord.GuildMember;

	if (params[0] == undefined && message.mentions.users.size == 0)
		userActivity = await message.guild.members.fetch(message.author.id);
	else if (params[0].length)
		userActivity =
			message.mentions.members.first() !== undefined
				? message.mentions.members.first()
				: await message.guild.members.fetch(params[0]).catch(() => {
						return undefined;
				  });

	if (userActivity === undefined)
		return message.channel
			.send(
				new Discord.MessageEmbed({
					title: "Error",
					description: "Could not find user.",
					color: "#7289DA",
				})
			)
			.then((msg) => msg.delete({ timeout: 2500 }));

	//* Management only.
	if (perms < 4 && params[0].length && userActivity.id !== message.author.id)
		return message.channel
			.send(
				new Discord.MessageEmbed({
					title: "Error",
					description: "No permissions.",
					color: "#7289DA",
				})
			)
			.then((msg) => msg.delete({ timeout: 2500 }));

	const dbData = await Promise.all([
		//* Get the user from the credits collection.
		await creditsColl.findOne(
			{ userId: userActivity.id },
			{ projection: { _id: false } }
		),

		//* Get all the accepted tickets of a user in the last 10 days.
		await ticketsColl
			.find(
				{
					accepter: userActivity.id,
					acceptedAt: {
						$gt: new Date(
							new Date().getTime() - 10 * 24 * 60 * 60 * 1000
						).valueOf(),
					},
				},
				{ projection: { _id: false } }
			)
			.toArray(),
	]);

	//@ts-ignore
	let cUser: User = dbData[0],
		acceptedTickets: Array<Ticket | number> = [],
		chartData: ChartConfiguration = {
			type: "line",
			data: {
				labels: last14Days(),
				datasets: [
					{
						label: "Accepted tickets",
						backgroundColor: "rgba(114, 137, 218, 0.5)",
						borderColor: "rgba(1, 116, 188, 0.5)",
						pointBackgroundColor: "#b3aeff",
						data: [],
					},
				],
			},
			options: {
				scales: {
					yAxes: [
						{
							ticks: {
								fontColor: "#eaeaea",
								stepSize: 2,
								min: 0,
								max: 16,
							},
						},
					],
					xAxes: [
						{
							ticks: {
								fontColor: "#c3c3c3",
							},
						},
					],
				},
				legend: {
					display: true,
					labels: {
						fontColor: "#ffffff",
					},
				},
			},
		};

	if (!cUser)
		return message.channel
			.send(
				new Discord.MessageEmbed({
					title: "Error",
					description: "Could not find user in the database.",
					color: "#7289DA",
				})
			)
			.then((msg) => msg.delete({ timeout: 2500 }));

	(cUser.allDates = []), (cUser.counts = {}), (cUser.tickets = dbData[1]);

	cUser.tickets.forEach((t: Ticket) =>
		cUser.allDates.push(formatDate(new Date(t.timestamp)))
	);

	cUser.allDates.forEach((d) => (cUser.counts[d] = (cUser.counts[d] || 0) + 1));

	chartData.data.labels.forEach((d: any) => {
		if (cUser.counts[d]) acceptedTickets.push(cUser.counts[d]);
		else acceptedTickets.push(0);
	});

	//@ts-ignore
	chartData.data.datasets[0].data = acceptedTickets;

	if (cUser.avatar.includes(".gif"))
		cUser.avatar = cUser.avatar.replace(".gif", ".png");

	const canvas = Canvas.createCanvas(620, 400),
		ctx = canvas.getContext("2d"),
		canvasRender = new CanvasRenderService(620, 300),
		chartDataURL = await canvasRender.renderToDataURL(chartData);

	ctx.drawImage(
		await Canvas.loadImage(path.join(__dirname, "../img/pattern.png")),
		0,
		0,
		canvas.width,
		canvas.height
	);

	//* Use the Inter font
	Canvas.registerFont(path.join(__dirname, "../fonts/Inter.ttf"), {
		family: "Inter Bold",
	});

	ctx.font = "28px 'Inter Bold'";
	ctx.fillStyle = "#ffffff";

	ctx.fillText(
		cUser.name.toUpperCase(),
		canvas.width / 2.14,
		canvas.height / 8
	);

	ctx.font = "15px 'Inter Bold'";
	ctx.fillStyle = cUser.roleColor;
	ctx.fillText(cUser.role, canvas.width / 2.14, canvas.height / 5.7);

	let chartImage = new Canvas.Image();
	chartImage.src = chartDataURL;

	ctx.drawImage(chartImage, 0, canvas.height / 4);

	ctx.beginPath();
	ctx.arc(canvas.width / 2.55, 50, 40, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();

	ctx.drawImage(
		await Canvas.loadImage(cUser.avatar),
		canvas.width / 3.05,
		10,
		80,
		80
	);

	message.channel
		.send({
			files: [canvas.toBuffer()],
		})
		.then((msg) => msg.delete({ timeout: 7500 }));
};

module.exports.config = {
	name: "activity",
	description: "Check the activity of a staff member.",
	permLevel: 1,
};

function formatDate(date) {
	var dd = date.getDate();
	var mm = date.getMonth() + 1;
	if (dd < 10) {
		dd = "0" + dd;
	}
	if (mm < 10) {
		mm = "0" + mm;
	}
	date = dd + "/" + mm;
	return date;
}

function last14Days() {
	var result = [];
	for (var i = 0; i < 14; i++) {
		var d = new Date();
		d.setDate(d.getDate() - i);
		result.push(formatDate(d));
	}
	result.reverse();
	return result;
}
