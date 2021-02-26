import UniformEmbed from "../../util/UniformEmbed";
import TicketStats from "./classes/TicketStats";

export default async(res, perms) => {
    let args = res.data.options[0], userActivity;
    
    if(!args.options || !args.options.find(a => a.name == "user")) userActivity = res.member;
    else if(args.options.find(a => a.name == "user")) userActivity = res.guild.members.resolve(args.options.find(a => a.name == "user").value);

    if(args.options?.length > 1 && args.options.find(a => a.name == "user")) 
        return res.channel.send(new UniformEmbed({description: `\`user\` argument can not be combined with \`average\` and \`perday\` argument.`}, ":bar_chart: Activity • Error", "#ff5050")).delete({ timeout: 10 * 1000 });
    
    if(args.options && args.options.find(a => a.name == "perday") && args.options.find(a => a.name == "average"))
        return res.channel.send(new UniformEmbed({description: `Argument \`average\` and \`perday\` can not be combined.`}, ":bar_chart: Activity • Error", "#ff5050")).delete({ timeout: 10 * 1000 });

    if(userActivity == undefined || userActivity.user.bot || perms < 1)
        return res.channel.send(new UniformEmbed({description: `User not found.`}, ":bar_chart: Activity • Error", "#ff5050")).delete({ timeout: 10 * 1000 });

    if(perms < 4 && args.options && args.options.find(a => a.name === "user" && a.value != userActivity.id))
        return res.channel.send(new UniformEmbed({description: `No permission.`}, ":bar_chart: Activity • Error", "#ff5050")).delete({ timeout: 10 * 1000 });

    let ticketStats = new TicketStats();
    res.channel.send(res.member.toString(), {
        files: [
            args.options?.find(a => a.name === "average")?.value
				? await ticketStats.getAvgTickets()
				: args.options?.find(a => a.name === "perday")?.value
				? await ticketStats.getTicketsPerDay()
				: await ticketStats.getUserActivity(userActivity.id)
        ]
    })

}