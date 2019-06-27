import * as Discord from "discord.js";
import { client } from "../../../index";

module.exports = packet => {
  if (["MESSAGE_DELETE", "MESSAGE_UPDATE"].includes(packet.t)) log(packet);
};

function log(packet) {
  console.log(packet.d);
}
