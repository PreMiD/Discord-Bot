module.exports = {
    name: "ready",
    type: "client",
    run: (client) => {
        client.success(`Connected as ${client.user.tag}`);
        client.user.setActivity(`premid.app`);

        require("../modules/status/");
    }
}