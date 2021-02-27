import { updateCredits, updateFlags } from "../methods"
import schedule from "node-schedule";

module.exports = {
    name: "ready",
    run: (client) => {
        schedule.scheduleJob("flag updater", "0 */6 * * *", updateFlags);

        updateCredits();
        setInterval(updateCredits, 15 * 1000);
    }
}