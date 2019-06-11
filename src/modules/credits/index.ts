import { db } from "../../database/db";
import { client } from "../../index";
import * as Discord from "discord.js";
import { encode } from "utf8";
import { readFileSync } from "fs";
import * as path from "path";

async function updateCredits() {
  var creditRoles = JSON.parse(
    await readFileSync("./modules/credits/creditRoles.json", "utf8")
  );

  var credits = (await db.query(
    "SELECT userID as id, roles, name, tag FROM credits "
  ))[0];

  (await ((await client.guilds.get(
    "493130730549805057"
  )) as Discord.Guild).members.fetch()).map(m => {
    //@ts-ignore
    var u = credits.find((md: any) => md.id == m.id);
    if (u) {
      //console.log(u.roles, m.roles.map(r => r.name));
      /*
              u.name != m.user.username ||
        u.tag != m.user.discriminator ||
        u.avatarURL != m.user.avatarURL ||
        u.roles != m.roles.map(r => r.name).toString()
      */
      if (true != true)
        db.query(
          "UPDATE credits SET name = ?, tag = ?, avatarURL = ? roles = ? WHERE userID = ?",
          [
            encode(m.user.username),
            m.user.discriminator,
            m.user.avatarURL,
            m.roles
              .map(r => (r.name == "@everyone" ? undefined : r.name))
              .filter(r => r !== undefined)
              .toString(),
            m.id
          ]
        );
    } else {
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
            cRoles.map(r => m.guild.roles.resolve(r.roleId).position)
          ),
          /*cRoles.filter(r => {
            
                      }),*/
          m.user.username
        );
      }
    }
  });
}

updateCredits();
