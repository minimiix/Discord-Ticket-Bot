const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");



client.on("ready",()=>{
    console.log("TicketBot is online!");
    client.user.setActivity("พิมพ์ !ticket create (เหตุผล) เพื่อสร้าง Ticket");
});

client.on("message",async message=>{
    if(message.author.bot||message.type=="dm")return;
    var arg = message.content.toLowerCase().split(" ");
    if(arg[0]!='!ticket')return;
    if(!message.guild.me.hasPermission("MANAGE_CHANNELS")||!message.guild.me.hasPermission("MANAGE_ROLES")){
        message.channel.send("Not enough permissions I require the `MANAGE_CHANNELS` and `MANAGE_ROLES` permission!");
        return;
    }
    let TicketCategory = message.guild.channels.find(channel=>channel.name==="Open Tickets");
    if(TicketCategory==null){
        await message.guild.createChannel('Open Tickets', {
            type: 'category',
            permissionOverwrites: [{
              id: message.guild.id,
              deny: ['READ_MESSAGES']
            }]
          })
          .then(t=>TicketCategory=t)
          .catch(console.error);
    }
    switch (arg[1]) {
        case "create":
            if(arg.length<=2){
                message.reply("คุณพิมพ์ไม่ถูกตอ้ง กรุณาพิมพ์ `!ticket create (เหตุผล)`");
                return;
            }
            let reason = arg.slice(2).join(" ");
            // reason=message.author+" issued a ticket with the reason\n\n**"+reason+"**";
            reason = new Discord.RichEmbed()
            .setTitle("คุณ "+message.author.username+" ได้สร้างticket")
            .setDescription(reason)
            .setFooter("โปรดรอสักครู่ แอดมินจะตอบกลับ")
            .setColor('#32cd32');
            if(reason.length>=1800){
                message.reply("Pls describe your problem in less words")
                return;
            }
            let roles = message.guild.roles.filter(x=>x.hasPermission("MANAGE_CHANNELS"));
            let perms=[];
            roles.forEach(role => {
               perms.push( 
                    {
                        id:role.id,
                        allow:["READ_MESSAGES"]
                    }
                )
              });
              perms.push(
                    {
                        id:message.guild.id,
                        deny: ["READ_MESSAGES"]
                    },
                    {
                        id: message.author.id,
                        allow:["READ_MESSAGES"]
                    }
              );
            message.guild.createChannel(message.author.username+"s ticket",{
                type:"text",
                parent:TicketCategory.id,
                permissionOverwrites:perms
            }).then(channel=>channel.send(reason))
            break;
        case "delete":
            if(!message.channel.name.endsWith("ticket")){
                message.reply("You must type this command in a open ticket");
                break;
            }
            message.reply("คุณยืนยันที่จะลบ Ticket นี้หรือไม่\nพิมพ์ `!ticket confirm` เพื่อยืนยัน.");
            
            const collector = message.channel.createMessageCollector(
                m=>m.content.toLowerCase().startsWith("!ticket confirm")&&m.author.id==message.author.id,
                {time:20000,max:1}
            );
            collector.on('collect', m => {
                if(!m.channel.deletable)message.reply("Error!!! I cannot delete this channel");
                else m.channel.delete();
              });
            break;
        case "help":
            var help = new Discord.RichEmbed()
                .setTitle("สวัสดี "+message.author.username+"!")
                .setDescription("คำสั่งในการใช้งาน")
                .addField("!ticket create <reason>","เพื่อสร้าง Ticket (พิมพ์คำสั่งในห้อง สร้างTicket)")
                .addField("!ticket delete","ใช้คำสั่งนี้เพื่อลบห้อ้ง Ticket ที่สร้าง")
                .setColor('#32cd32');
            message.author.send(help);
            break;
        default:
            break;
    }
});







client.login(config.token);