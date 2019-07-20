import * as Discord from "discord.js";

//* Extend Client from discord.js
declare module "discord.js" {
  interface Client {
    commands: Discord.Collection<String | undefined, CommandProps>;
    aliases: Discord.Collection<String, String>;
    elevation: Function;
  }
}

//* Command Properties
interface CommandProps {
  name: String;
  permLevel: Number;
  enabled: Boolean;
  aliases: Array<String>;
}
