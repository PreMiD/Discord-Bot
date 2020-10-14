import * as Discord from "discord.js";
import { Ticket } from "../classes/Ticket";

module.exports.run = async (
	message: Discord.Message
) => {
	let t = new Ticket(), dm = message.channel.type == "dm", ticketFound;

	if(dm) ticketFound = await t.fetch("author", message.author.id)
	else ticketFound = await t.fetch("channel", message.channel.id);

	if (!ticketFound) return;

	if(!message.attachments.first()) return message.reply("please attach an image when running that command!");
	
	t.attach(message.attachments.first());

	message.channel.send("The attachment has been added!");
};

module.exports.config = {
	name: "attach",
	description: "Attach images to a ticket",
	hidden: true
};
