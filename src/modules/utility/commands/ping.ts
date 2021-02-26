module.exports = {
    config: {
        name: "ping",
        aliases: [],
        description: "Returns the bot's ping.",
        slashCommand: true
    },
    run: (data, _, client) => {
        let embed = {
            description: `**We** to **Discord** (\`\`${client.ws.ping}\`\`)`,
            color: client.ws.ping < 250
                ? "#50ff50"
                : client.ws.ping > 250 && client.ws.ping < 500
                ? "#ffff50"
                : "#ff5050"
        }

        if(data) data.channel.send({embed});
    }
}