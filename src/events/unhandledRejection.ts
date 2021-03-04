import { MessageEmbed, WebhookClient } from "discord.js";

export default {
    name: "unhandledRejection",
    type: "process",
    run: (client, err) => {
        client.error(err);

        const wh = process.env.ERRORSWEBHOOK.split(","),
		hook = new WebhookClient(wh[0], wh[1]);

        hook.send(
            new MessageEmbed({
                title: "Discord-Bot",
                color: "#ff5050",
                description: `\`\`\`${err.stack.toString()}\`\`\``
            })
        );
    }
};
