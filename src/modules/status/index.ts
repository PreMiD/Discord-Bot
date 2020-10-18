//! Temporary until I find a fix for the config -Tony
const statusUpdateChannel = "518467470894563345";
const statusUpdateURL =
	"https://status.premid.app/api/v2/incidents/unresolved.json";
import axios from "axios";
import { client } from "../..";
import { TextChannel } from "discord.js";

//* Cache that stores the incident data
let cache = {
	lastIncident: null,
	lastUpdate: null,
	incidentsSeen: 0
};

//* Impact and other colors
const colors = {
	none: null,
	minor: 0xfc9e43,
	major: 0xf6640d,
	critical: 0xdd2e44,
	incidentResolved: 0x77ff77
};

//* Interval/check time
const time = 3 * 1000 * 60;

//* Helper function for strings to make them readable
const toTitleCase = function (str) {
	return str
		.toLowerCase()
		.split(" ")
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

setInterval(async () => {
	try {
		//* Run the check...
		const res = await exports.checkStatus();

		//* Check returned true
		if (res && res.send === true) {
			const channel = (await client.channels.cache.get(
				statusUpdateChannel
			)) as TextChannel;

			//* Type 0 = new incident
			if (res.type === 0) {
				const x = cache.lastIncident;
				const u = cache.lastUpdate;

				//* Create the message
				const fields = [
					{ name: "Components Affected", value: x.components.join(", ") }
				];
				if (x.impact !== "none")
					fields.push({ name: "Impact", value: toTitleCase(x.impact) });
				const msg = {
					embed: {
						title: x.name,
						url: x.url,
						description: u.body,
						fields,
						timestamp: x.createdAt,
						color: colors[x.impact || "none"]
					}
				};

				//* Send it and return the message
				return await channel.send(msg);
			}

			//* Type 1 = existing incident with an update
			if (res.type === 1) {
				const x = cache.lastIncident;
				const u = cache.lastUpdate;

				//* Create the message
				const msg = {
					embed: {
						title: `${x.name} updated to ${toTitleCase(u.status)}`,
						url: x.url,
						description: u.body,
						timestamp: u.createdAt
					}
				};

				//* Send it and return the message
				return await channel.send(msg);
			}

			//* Type 2 - resolved incident
			if (res.type === 2) {
				const x = cache.lastIncident;

				//* Create the message
				const msg = {
					embed: {
						title: `${x.name} resolved`,
						url: x.url,
						timestamp: x.createdAt,
						color: colors.incidentResolved
					}
				};

				//* Clear incident from the cache
				cache.lastIncident = null;
				cache.lastUpdate = null;
				cache.incidentsSeen = 0;

				//* Send it and return the message
				return await channel.send(msg);
			}
		}

		//* Check returned false, nothing more to do
		else return;
	} catch (err) {
		console.error(err);
	}
}, time);

export async function checkStatus() {
	try {
		//* Request the API
		const { data: body } = await axios.get(statusUpdateURL);

		//* Incident found, continue
		if (body.incidents.length > 0) {
			//* Define the incident as the first entry
			const incident = body.incidents[0];

			//* Bot already knows about this incident
			if (cache.lastIncident && incident.id === cache.lastIncident.id) {
				//* Incident count is higher than what the bot knows of
				if (incident.incident_updates.length > cache.incidentsSeen) {
					const incidentUpdate = incident.incident_updates[0];

					//* Make sure this isn't the same incident
					if (cache.lastIncident.id === incidentUpdate.id)
						return { send: false, type: null };

					cache.lastUpdate = {
						id: incidentUpdate.id,
						body: incidentUpdate.body,
						status: incidentUpdate.status,
						createdAt: new Date(incidentUpdate.display_at)
					};

					cache.incidentsSeen = incident.incident_updates.length;

					//* Return true - indicates to the bot to send a message (type 1: updated incident)
					return { send: true, type: 1 };
				}

				//* Incident count hasn't changed, return false
				else return { send: false, type: null };
			}

			//* Bot doesn't know about this incident yet
			else {
				//* Store the parts of the incident needed
				cache.lastIncident = {
					id: incident.id,
					name: incident.name,
					impact: incident.impact,
					components: incident.components.map(c => {
						return c.name;
					}),
					url: incident.shortlink,
					createdAt: new Date(incident.created_at)
				};

				cache.lastUpdate = {
					id:
						incident.incident_updates[incident.incident_updates.length - 1]
							.incident_id,
					body:
						incident.incident_updates[incident.incident_updates.length - 1]
							.body,
					status:
						incident.incident_updates[incident.incident_updates.length - 1]
							.status,
					createdAt: new Date(
						incident.incident_updates[
							incident.incident_updates.length - 1
						].display_at
					)
				};

				cache.incidentsSeen = 1;

				//* Return true - indicates to the bot to send a message (type 0: new incident)
				return { send: true, type: 0 };
			}
		}

		//* No incidents found
		else {
			//* Mark existing incidents as resolved and delete it
			if (cache.lastIncident !== null) {
				//* Return true - indicates to the bot to send a message (type 2: resolved incident)
				return { send: true, type: 2 };
			}

			//* Return false
			return { send: false, type: null };
		}
	} catch (err) {
		console.error(err);
		return err;
	}
}
