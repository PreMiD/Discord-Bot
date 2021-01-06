import { pmdDB } from "../../database/client";

export let blacklistedWords: string[] = [];

(async () => {
	await updateBlacklist();
})();

async function updateBlacklist() {
	blacklistedWords = (
		await pmdDB
			.collection("blacklist")
			.find({}, { projection: { _id: false, word: true } })
			.toArray()
	).map(w => w.word) as string[];
}
