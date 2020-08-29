import { client } from "../..";
import { pmdDB } from "../../database/client";
import roles from "../../roles";
import { unmute } from "./commands/warn";

export let blacklistedWords: string[] = [];

(async () => {
	let coll = pmdDB.collection("mutes"),
		mutes = await coll.find({ mutedUntil: { $exists: true } }).toArray();

	mutes.map(mute => {
		//* If user doesn't have mute role, delete mute from db
		client.guilds.cache
			.first()
			.members.fetch(mute.userId)
			.then(m => {
				if (!m.roles.cache.has(roles.muted))
					coll.findOneAndDelete({ userId: mute.userId });
			})
			.catch(() => {});

		//* If mute penalty time expired unmute else setTimeout to do it when it ends
		if (mute.mutedUntil - Date.now() <= 0) unmute(mute.userId);
		else setTimeout(() => unmute(mute.userId), mute.mutedUntil - Date.now());
	});

	updateBlacklist();
	setInterval(updateBlacklist, 60 * 1000);
})();

async function updateBlacklist() {
	blacklistedWords = (
		await pmdDB
			.collection("blacklist")
			.find({}, { projection: { _id: false, word: true } })
			.toArray()
	).map(w => w.word) as string[];
}
