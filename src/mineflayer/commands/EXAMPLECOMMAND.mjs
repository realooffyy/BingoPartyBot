import { DisableCommand, Permissions } from "../../utils/Interfaces.mjs";

export default {
  name: ["command1", "command2"], // This command will be triggered by either command1 or command2
  ignore: true, // Whether to ignore this file or not
  description: "Test command", // Description of the command
  usage: "!p command1 <arg1> [optional arg2]", // Command usage pattern for use in `!p help`
  permission: Permissions.Admin, // Permission level required to execute this command
  customPrefix: "", // Only use this if you want to use a custom prefix for this command, otherwise leave it empty and it'll use the default prefix
  isPartyChatCommand: false, // Set to true if the command should be used in party chat, also include the command's prefix (if applicable) in the name (e.g. '!guide')
  disableCommand: DisableCommand.Normal, // Set to `ForceEnabled`/`UsuallyKeepEnabled` for commands that shouldn't always be disabled (refer to `Interfaces.mjs`)
  /**
   *
   * @param {import("../../Bot.mjs").default} bot
   * @param {String} sender
   * @param {Array<String>} args
   */
  execute: async function (bot, sender, args) {
    // Code here…
    /* Some remarks:
       - If you have some sort of status update or confirmation to give back to
         the sender, use bot.reply(sender, msg)
       - If you parse for an incorrectly used arg, you can notify the command sender by:
          return bot.reply(
            sender,
            `Invalid usage! Use: ${this.usage}`,
            VerbosityLevel.Reduced,
          );
       - Sending links (https://…) that aren't found on the hypixel.net domain won't work,
         unfortunately, due to Hypixel's limitations on "advertising"
    */
    /*
      Also read the section about custom functions/use of aliases in
      CONTRIBUTING.md for more things that are good to know =)
    */
  },
};
