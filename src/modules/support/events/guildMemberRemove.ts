import {client} from "../../../";

let coll = client.db.collection("tickets");

module.exports = {
    name: "guildMemberRemove",
    run: async (client, user) => {
        let tickets = await coll.find({ userId: user.id }).toArray();

        tickets.map(x => {
            if(x.status != 3) x.close(client.user, "Creator left server.");
        });
    }
}