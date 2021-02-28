import * as Methods from "../methods";

export default {
    name: "ready",
    run: () => {
        Methods.sortTickets();
        Methods.updateTopic();
        Methods.checkOldTickets();
        Methods.checkDuplicates();
        
        setInterval(Methods.sortTickets, 12000);
        setInterval(Methods.updateTopic, 2 * 60 * 1000);
        setInterval(Methods.checkDuplicates, 10 * 1000);
        setInterval(Methods.checkOldTickets, 15 * 60 * 1000);
    }
}