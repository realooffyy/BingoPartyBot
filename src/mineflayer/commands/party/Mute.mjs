import { Permissions } from "../../../utils/Interfaces.mjs";

export default {
    name: ["mute", "unmute"], // This command will be triggered by either command1 or command2
    ignore: false, // Whether to ignore this file or not
    description: "Mute Command", // Description of the command
    permission: Permissions.Trusted, // Permission level required to execute this command
    /**
     * 
     * @param {import("../../Bot.mjs").default} bot 
     * @param {String} sender 
     * @param {Array<String>} args 
     */
    execute: async function (bot, sender, args) {
        // Code here
        bot.bot.chat(`/pc ${sender} has muted/unmuted the party.`);
        setTimeout(() => {
            bot.bot.chat(`/p mute`);
            bot.webhook.send(
                {
                    username: bot.config.webhook.name,
                },
                {
                    content: `Muted/Unmuted party. Command executed by ${sender}`,
                }
            );
        })
    }
  }
  