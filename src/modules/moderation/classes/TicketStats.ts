//@ts-nocheck
import * as Canvas from "canvas";
import { ChartConfiguration } from "chart.js";
import { CanvasRenderService } from "chartjs-node-canvas";
import * as Discord from "discord.js";
import path from "path";
import { client } from "../../../";

let ticketsColl = client.db.collection("tickets"), creditsColl = client.db.collection("credits");

export default class TicketStats {
	user: Discord.User;

	constructor() {}

	async getTicketsPerDay() {
		let dbTickets = (await ticketsColl
				.find(
					{
						acceptedAt: {
							$gt: new Date(
								new Date().getTime() - 14 * 24 * 60 * 60 * 1000
							).valueOf(),
						},
					},
					{ projection: { _id: false } }
				)
				.toArray()),
			allDates = [],
			counts = {},
			tickets = [];

		dbTickets.forEach(t => allDates.push(this.formatDate(new Date(t.timestamp))));

		allDates.forEach(d => (counts[d] = (counts[d] || 0) + 1));

		this.last14Days().forEach((d: any) => {
			if (counts[d]) tickets.push(counts[d]);
			else tickets.push(0);
		});

		let chartData: ChartConfiguration = {
				type: "bar",
				data: {
					labels: this.last14Days(),
					datasets: [
						{
							label: "Tickets",
							backgroundColor: "rgba(114, 137, 218, 0.5)",
							borderColor: "rgba(179, 174, 255, 1)",
							borderWidth: 1,
							data: tickets,
						},
					],
				},
				options: {
					scales: {
						yAxes: [
							{
								ticks: {
									fontColor: "#eaeaea",
									stepSize: 10,
									min: 0,
									max: 80,
									beginAtZero: true,
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
			},
			canvas = await this.createCanvas(),
			ctx = canvas.getContext("2d"),
			canvasRender = new CanvasRenderService(620, 300),
			chartDataURL = await canvasRender.renderToDataURL(chartData),
			chartImage = new Canvas.Image();

		ctx.font = "28px 'Inter Regular'";
		ctx.fillStyle = "#ffffff";

		ctx.fillText(
			"Last 14 days tickets number",
			canvas.width / 5,
			canvas.height / 5.5
		);

		chartImage.src = chartDataURL;
		ctx.drawImage(chartImage, 0, ctx.canvas.height / 4);

		return canvas.toBuffer();
	}

	async getUserActivity(userId: string) {
		const dbData = await Promise.all([
			await creditsColl.findOne(
				{ userId: userId },
				{ projection: { _id: false } }
			),

			await ticketsColl
				.find(
					{
						accepter: userId,
						acceptedAt: {
							$gt: new Date(
								new Date().getTime() - 10 * 24 * 60 * 60 * 1000
							).valueOf(),
						},
					},
					{ projection: { _id: false } }
				)
				.toArray(),

			await ticketsColl
				.find(
					{
						accepter: { $ne: userId },
						acceptedAt: {
							$gt: new Date(
								new Date().getTime() - 10 * 24 * 60 * 60 * 1000
							).valueOf(),
						},
						supporters: { $in: [userId] },
					},
					{ projection: { _id: false } }
				)
				.toArray(),

			await ticketsColl
				.find(
					{
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

		let userTickets = {
				acceptedTickets: [],
				joinedTickets: [],
				a: { allDates: [], counts: {} },
				j: { allDates: [], counts: {} },
			},
			accepted = [],
			joined = [];

		(userTickets.acceptedTickets = dbData[1]), (userTickets.joinedTickets = dbData[2]);

		userTickets.acceptedTickets.forEach(t => userTickets.a.allDates.push(this.formatDate(new Date(t.timestamp))));
		userTickets.joinedTickets.forEach(t => userTickets.j.allDates.push(this.formatDate(new Date(t.timestamp))));

		userTickets.a.allDates.forEach(d => (userTickets.a.counts[d] = (userTickets.a.counts[d] || 0) + 1));
		userTickets.j.allDates.forEach(d => (userTickets.j.counts[d] = (userTickets.j.counts[d] || 0) + 1));

		this.last14Days().forEach((d: any) => {
			if (userTickets.a.counts[d]) accepted.push(userTickets.a.counts[d]);
			else accepted.push(0);

			if (userTickets.j.counts[d]) joined.push(userTickets.j.counts[d]);
			else joined.push(0);
		});

		let chartData: ChartConfiguration = {
				type: "line",
				data: {
					labels: this.last14Days(),
					datasets: [
						{
							label: "Accepted tickets",
							borderColor: "#7289da",
							pointBackgroundColor: "#7289da",
							pointRadius: 3,
							data: accepted,
						},
						{
							label: "Joined tickets",
							borderColor: "rgba(126, 81, 194, 1)",
							borderDash: [5, 5],
							pointBackgroundColor: "#7E51C2",
							pointRadius: 3,
							data: joined,
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
			},
			canvas = await this.createCanvas("../img/pattern.png"),
			ctx = canvas.getContext("2d"),
			canvasRender = new CanvasRenderService(620, 300),
			chartDataURL = await canvasRender.renderToDataURL(chartData),
			user = dbData[0]

		ctx.font = "28px 'Inter Bold'";
		ctx.fillStyle = "#ffffff";

		ctx.fillText(
			user.name.toUpperCase(),
			canvas.width / 2.14,
			canvas.height / 8
		);

		ctx.font = "15px 'Inter Bold'";
		ctx.fillStyle = user.roleColor;
		ctx.fillText(user.role, canvas.width / 2.14, canvas.height / 5.7);

		let avatar = new Canvas.Image();
		avatar.src = chartDataURL;

		ctx.drawImage(avatar, 0, canvas.height / 4);
		ctx.beginPath();
		ctx.arc(canvas.width / 2.55, 50, 40, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.clip();

		ctx.drawImage(
			await Canvas.loadImage(user.avatar),
			canvas.width / 3.05,
			10, 80, 80
		);

		return canvas.toBuffer();
	}

	async getAvgTickets() {
		const dbData = await Promise.all([
			await creditsColl
				.find(
					{ roleIds: { $in: [client.config.roles.ticketManager] } },
					{ projection: { _id: false, userId: true, name: true } }
				)
				.toArray(),

			await ticketsColl
				.find(
					{
						acceptedAt: {
							$gt: new Date(
								new Date().getTime() - 14 * 24 * 60 * 60 * 1000
							).valueOf(),
						},
					},
					{
						projection: {
							_id: false,
							accepter: true,
							supporters: true,
							timestamp: true,
						},
					}
				)
				.toArray(),
		]);

		let sAgents = dbData[0],
			tickets = dbData[1],
			userTickets = [],
			resultsPerDay = [];

		sAgents.forEach(sA => {
			userTickets[sA.userId] = { allDates: [], counts: {} };

			tickets.forEach(t => {
				if (sA.userId === t.accepter) {
					userTickets[sA.userId].allDates.push(
						this.formatDate(new Date(t.timestamp))
					);
				}
			});

			userTickets[sA.userId].allDates.forEach(d => (userTickets[sA.userId].counts[d] = (userTickets[sA.userId].counts[d] || 0) + 1));

			this.last14Days().forEach((d: any, i) => {
				if (!resultsPerDay[i]) resultsPerDay[i] = 0;
				if (userTickets[sA.userId].counts[d])
					resultsPerDay[i] += userTickets[sA.userId].counts[d];
			});
		});

		resultsPerDay.forEach((no, i) => resultsPerDay[i] = no / sAgents.length);

		let chartData: ChartConfiguration = {
				type: "line",
				data: {
					labels: this.last14Days(),
					datasets: [
						{
							label: "Tickets",
							borderColor: "#7289da",
							pointBackgroundColor: "#7289da",
							pointRadius: 3,
							data: resultsPerDay,
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
									max: 8,
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
			},
			canvas = await this.createCanvas(),
			ctx = canvas.getContext("2d"),
			canvasRender = new CanvasRenderService(620, 300),
			chartDataURL = await canvasRender.renderToDataURL(chartData),
			chartImage = new Canvas.Image();

		ctx.font = "28px 'Inter Regular'";
		ctx.fillStyle = "#ffffff";

		ctx.fillText(
			"Average tickets per support agent",
			canvas.width / 8,
			canvas.height / 5.5
		);

		chartImage.src = chartDataURL;
		ctx.drawImage(chartImage, 0, ctx.canvas.height / 4);

		return canvas.toBuffer();
	}

	async createCanvas(background?: string) {
		const canvas = Canvas.createCanvas(620, 400), ctx = canvas.getContext("2d");

		ctx.drawImage(
			await Canvas.loadImage(path.join(__dirname, background ? background : "../img/stats.png")), 0, 0,
			canvas.width,
			canvas.height
		);

		Canvas.registerFont(path.join(__dirname, "../fonts/Inter.ttf"), {family: "Inter Bold"});
		Canvas.registerFont(path.join(__dirname, "../fonts/InterRegular.ttf"), {family: "Inter Regular"});

		return canvas;
	}

	formatDate(date) {
		var dd = date.getDate(), mm = date.getMonth() + 1;
		if (dd < 10) dd = "0" + dd;
		if (mm < 10) mm = "0" + mm;
		return date = dd + "/" + mm;
	}

	last14Days() {
		var result = [];
		for (var i = 0; i < 14; i++) {
			var d = new Date();
			d.setDate(d.getDate() - i);
			result.push(this.formatDate(d));
		}
		result.reverse();
		return result;
	}
}