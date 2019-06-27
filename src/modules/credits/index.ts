import { db } from "../../database/db";
import { client } from "../../index";
import * as Discord from "discord.js";
import { encode } from "utf8";
import { readFileSync } from "fs";

async function updateCredits() {
  var creditRoles = JSON.parse(
    await readFileSync("./modules/credits/creditRoles.json", "utf8")
  );

  var credits = (await db.query(
    "SELECT userID as id, roles, name, tag FROM credits "
  ))[0];

  (await ((await client.guilds.first()) as Discord.Guild).members.fetch()).map(
    m => {
      //@ts-ignore
      var u = credits.find((md: any) => md.id == m.id);
      if (u) {
        /*
              u.name != m.user.username ||
        u.tag != m.user.discriminator ||
        u.avatarURL != m.user.avatarURL ||
        u.roles != m.roles
            .filter(r => r.name != "@everyone")
            .sort((a, b) => a.position + b.position)
            .map(r => r.name)
            .join(",")
      */
        if (
          u.name != m.user.username ||
          u.tag != m.user.discriminator ||
          u.avatarURL != m.user.displayAvatarURL() ||
          u.roles !=
            m.roles
              .filter(r => r.name != "@everyone")
              .sort((a, b) => a.position + b.position)
              .map(r => r.name)
              .join(",")
        )
          db.query("UPDATE credits SET name = ?, tag = ? WHERE userID = ?", [
            encode(m.user.username),
            m.user.discriminator,
            m.id
          ]);
      } else {
        return;

        var cRoles = creditRoles.filter((r: any) => m.roles.has(r.roleId));
        if (cRoles.length > 0) {
          /*
          db.query('INSERT INTO credits (userID, name, tag, avatarURL, type, color, patronColor, position, roles)', [
            m.id, m.nickname == null ? m.user.username : m.nickname, m.user.discriminator, m.user.avatarURL, , , , m.roles.highest.position, m.roles.map(r => r.name)
          ])
         */
          console.log(
            Math.max.apply(
              Math,
              cRoles.map((r: any) => m.guild.roles.resolve(r.roleId).position)
            ),
            /*cRoles.filter(r => {
            
                      }),*/
            m.user.username
          );
        }
      }
    }
  );
}

updateCredits();
