module.exports = {
    name: "unhandledRejection",
    type: "process",
    run: (client, error) => {
        if(error.stack.includes("DiscordAPIError: Missing Permissions")) return;
        client.error(error.stack);
    }
};
