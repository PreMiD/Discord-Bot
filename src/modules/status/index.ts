import axios from "axios";
import { TextChannel } from "discord.js";
import { client } from "../../";

let { channels } = client.config,
    cache = {
        lastIncident: null,
        lastUpdate: null,
        incidentsSeen: 0
    },
    colors = {
		none: null,
		minor: 0xfc9e43,
		major: 0xf6640d,
		critical: 0xdd2e44,
		incidentResolved: 0x77ff77
	},
	statusUpdateURL = "https://status.premid.app/api/v2/incidents/unresolved.json",
	statusUpdateChannel = channels.statusUpdates,
	time = 3 * 1000 * 60,
	toTitleCase = str => str
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

setInterval(async _ => {
    try {
        const res = await exports.checkStatus();

        if(res && res.send == true) {
            const channel = (await client.channels.cache.get(statusUpdateChannel));

            if(res.type == 0) {
                const x = cache.lastIncident,
                    u = cache.lastUpdate,
                    fields = [
                        { name: "Components Affected", value: x.components.join(", ") }
                    ];

                if (x.impact != "none") fields.push({ name: "Impact", value: toTitleCase(x.impact) });

                return await (channel as TextChannel).send({
                    embed: {
                        title: x.name,
                        url: x.url,
                        description: u.body,
                        fields,
                        timestamp: x.createdAt,
                        color: colors[x.impact || "none"]
                    }
                });
            }

            if(res.type == 1) {
                const x = cache.lastIncident, u = cache.lastUpdate;
                return await (channel as TextChannel).send({
                    embed: {
                        title: `${x.name} updated to ${toTitleCase(u.status)}`,
						url: x.url,
						description: u.body,
						timestamp: u.createdAt
                    }
                })
            }

            if(res.type == 2) {
                const x = cache.lastIncident;

                cache.lastIncident = null;
				cache.lastUpdate = null;
				cache.incidentsSeen = 0;

                return await (channel as TextChannel).send({
					embed: {
						title: `${x.name} resolved`,
						url: x.url,
						timestamp: x.createdAt,
						color: colors.incidentResolved
					}
                });
            }
        }
    } catch (e) { console.error(e); }
}, time)

export async function checkStatus() {
    try {
        const { data } = await axios(statusUpdateURL);

        if(data.incidents.length > 0) {
            const incident = data.incidents[0];

            if (cache.lastIncident && incident.id === cache.lastIncident.id) {
                if (incident.incident_updates.length > cache.incidentsSeen) {
                    const incidentUpdate = incident.incident_updates[0];
                    if (cache.lastIncident.id === incidentUpdate.id) return { send: false, type: null };

					cache.lastUpdate = {
						id: incidentUpdate.id,
						body: incidentUpdate.body,
						status: incidentUpdate.status,
						createdAt: new Date(incidentUpdate.display_at)
					};

					cache.incidentsSeen = incident.incident_updates.length;

                    return { send: true, type: 1 };
                } else return { send: false, type: null };
            } else {
				let incidentCurr = incident.incident_updates[incident.incident_updates.length - 1];

				cache.lastIncident = {
					id: incident.id,
					name: incident.name,
					impact: incident.impact,
					components: incident.components.map(c => c.name),
					url: incident.shortlink,
					createdAt: new Date(incident.created_at)
				};

				cache.lastUpdate = {
					id: incidentCurr.incident_id,
					body: incidentCurr.body,
					status: incidentCurr.status,
					createdAt: new Date(incidentCurr.display_at)
				};

				cache.incidentsSeen = 1;

				return { send: true, type: 0 };
            }
        } else if (cache.lastIncident !== null) return { send: true, type: 2 };
			else return { send: false, type: null };
    } catch (e) { console.error(e); }
}