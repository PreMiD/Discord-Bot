import { client } from "../../.."

let coll = client.db.collection("credits");

module.exports = {
    name: "presenceUpdate",
    run: (_, oldP, newP) => {
        if (!oldP || newP.status == oldP.status) return;
        coll.findOneAndUpdate(
            { userId: newP.userID },
            { $set: { status: newP.status } }
        );
    }
}