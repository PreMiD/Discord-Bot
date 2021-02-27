import {client} from "../../../";

const coll = client.db.collection("tickets");

export default {
    name: "guildMemberRemove",
    run: async (client, user) => {
        const tickets = await coll.find({ userId: user.id }).toArray();

        tickets.forEach(x => {
            if(x.status !== 3) x.close(client.user, "Creator left server.");
        });
    }
}