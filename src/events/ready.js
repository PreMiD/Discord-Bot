module.exports = (client) => {
	//* Send debug
	console.log(`Bot connected to Discord API`);
	//* Set bot status & activity
	client.user.setStatus(process.env.NODE_ENV == 'dev' ? 'dnd' : 'online');
	client.user.setActivity(process.env.NODE_ENV == 'dev' ? 'devs code...' : 'YouTube', {
		type: 'WATCHING'
	});

	fetchMessages(client);

	//* Start credits updater
	require('../util/credits')();
};

function fetchMessages(client) {
	var { ticketChannel } = require('../config.json');
	client.guilds.get('493130730549805057').channels.get(ticketChannel).fetchMessages({ limit: 100 });
}
