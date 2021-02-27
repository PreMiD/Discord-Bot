import { client } from "../../.."

const coll = client.db.collection("credits");

export default {
    name: "presenceUpdate",
    run: (_, oldP, newP) => {
        if (!oldP || newP.status === oldP.status) return;
        coll.findOneAndUpdate(
            { userId: newP.userID },
            { $set: { status: newP.status } }
        );
    }
}