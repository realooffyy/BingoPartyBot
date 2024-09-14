import axios from "axios";
import { DebugOptions, MessageType } from "./Interfaces.mjs";
import { createLogger, format, transports } from "winston";
import JSONdb from "simple-json-db";

class Utils {
  constructor(debug = false, allowList = [], kickList = [], rulesList = []) {
    this.debug = new Debug(debug); // Set Debug class
    this.kickList = kickList; // Set kickList
    this.refreshKickList(); // Turn on kickList refreshing
    this.rulesList = rulesList; // Set rulesList
    this.refreshRulesList(); // Turn on rulesList refreshing
  }

  setPlayerNameDatabase(database) {
    /** @type {JSONdb}  */
    this.playerNamesDatabase = database;
  }

  /**
   *
   * @param {String} message
   * @param {"Info"|"Warn"|"Error"} type
   */
  log(message, type) {
    logger[type.toLowerCase()](message);
  }

  async getRulesList() {
    if (this.rulesList.length === 0)
      this.rulesList = await import(
        `../../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
        { assert: { type: "json" } }
      );
    this.rulesList = this.rulesList.default;
    return this.rulesList;
  }

  refreshRulesList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../../data/bingoBrewersRules.json?cacheBust=${Date.now()}`,
          {
            assert: { type: "json" },
          }
        );
        this.rulesList = configModule.default; // Access the default export of the JSON module
        // DEBUG: console.log("Allowlist updated:", allowlist);
      } catch (error) {
        console.error("Error updating allowlist:", error);
      }
    }, 10000);
  }

  async getKickList() {
    if (this.kickList.length === 0)
      this.kickList = await import(
        `../../data/autoKickWords.json?cacheBust=${Date.now()}`,
        { assert: { type: "json" } }
      );
    this.kickList = this.kickList.default;
    return this.kickList;
  }

  refreshKickList() {
    setInterval(async () => {
      try {
        const configModule = await import(
          `../../data/autoKickWords.json?cacheBust=${Date.now()}`,
          {
            assert: { type: "json" },
          }
        );
        this.kickList = configModule.default.autoKickWords; // Access the default export of the JSON module
      } catch (error) {
        console.error("Error updating kickList:", error);
      }
    }, 10000);
  }

  // Get uuid from username
  async getUUID(username) {
    let data = await axios.get(
      `https://api.mojang.com/users/profiles/minecraft/${username}`,
    );
    if (data.data.errorMessage) return null;
    return data.data.id;
  }

  // Get username from uuid
  async getUsername(uuid) {
    let data = await axios.get(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
    );
    if (data.data.errorMessage) return null;
    return data.data.name;
  }

  getUsersByPermissionRank(rank) {
    return this.playerNamesDatabase
      .get("data")
      .filter((x) => x.permissionRank === rank);
  }

  /**
   *
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getPermissionsByUser(options = {}) {
    if (!options || (!options.uuid && !options.name)) {
      throw new Error(
        "Invalid options: 'uuid' or 'name' must be provided for permissions check.",
      );
    }

    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    let processed = this.playerNamesDatabase
      .get("data")
      .find((x) =>
        x.accounts.some(
          (y) =>
            (options.uuid && y.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name && y.name.toLowerCase() == options.name),
        ),
      );
    if (!processed) return null;
    return processed.permissionRank;
  }

  /**
   * Use this to replace getHypixelRankByName
   * @param {Object} options
   * @param {string} [options.uuid]
   * @param {string} [options.name]
   * @returns {Object|null}
   */
  getUserObject(options = {}) {
    if (!options || (!options.uuid && !options.name)) {
      throw new Error(
        "Invalid options: 'uuid' or 'name' must be provided to get user info.",
      );
    }

    if (options.uuid) options.uuid = options.uuid.toLowerCase();
    if (options.name) options.name = options.name.toLowerCase();
    return this.playerNamesDatabase
      .get("data")
      .find((x) =>
        x.accounts.some(
          (y) =>
            (options.uuid && y.uuid && y.uuid.toLowerCase() == options.uuid) ||
            (options.name && y.name && y.name.toLowerCase() == options.name),
        ),
      );
  }

  /**
   * Returns a random alphanumeric string.
   * Originally written by ooffyy.
   * @param {Number} length
   * @returns the random string
   */
  /* const */
  #generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  /**
   * Adds on a random string of characters to bypass if eligible.
   * Originally written by ooffyy.
   * @param {String} string string to append
   * @returns formatted/unformatted string
   */
  addRandomString(string) {
    // TODO: Potentially cap this to the maximum message length of like 256 and
    // accept/allow a *veeeery* long message to not go through.
    return (
      string +
      ` ${this.#generateRandomString(string.length * 0.33 < 6 ? 6 : string.length * 0.33)}`
    );
  }
}

const logger = createLogger({
  level: "debug",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      stderrLevels: ["error"],
    }),
  ],
});

class Debug {
  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   *
   * @param {Array} allowList The list of people
   * @param {DebugOptions} options Options for the debugging
   * @returns
   */
  printAllowList(allowList, options = DebugOptions) {
    if (!this.debug) return;
    if (options.printAll)
      console.log(
        allowList
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
    if (options.printLength) console.log(allowList.length);
    if (options.printFirst) console.log(allowList[0]);
    if (options.printLast) console.log(allowList[allowList.length - 1]);
    if (options.printRank)
      console.log(
        allowList
          .filter((x) => x.permissionRank === options.printRank)
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
    if (options.printUser)
      console.log(
        allowList
          .filter((x) => x.uuids.includes(options.printUser))
          .map(
            (x) =>
              `Player UUIDs: ${x.accounts
                .map((y) => `${y.name} (${y.uuid})`)
                .join(", ")}\nPermissions: ${x.permissionRank}\n--------------`,
          )
          .join("\n"),
      );
  }

  /**
   *
   * @param {String} message
   * @param {"Info"|"Warn"|"Error"} type
   */
  log(message) {
    if (this.debug) {
      logger.debug(message);
    }
  }
}

const messageRegex =
  /^(?:Party >|From) ?(?:(\[.*?\]) )?(\w{1,16}): (.*?)(?:§.*)?$/s;

export default {
  removeRank: function (name) {
    return name.replace(/\[.+]/g, "").trim();
  },

  determineMessageType: function (parsedMsgObj) {
    if (isWhisper(parsedMsgObj)) return MessageType.Whisper;
    else if (isPartyInvite(parsedMsgObj).isPartyInvite)
      return MessageType.PartyInvite;
    else if (isPartyMessage(parsedMsgObj)) return MessageType.PartyMessage;
    else return MessageType.Other;
  },

  stripColorCodes: function (str) {
    return str.replace(/§[0-9a-fk-or]/g, ""); //DuckDuckBang gave this
  },

  capitalizeFirstLetter: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },
};

let utils = new Utils(
  true,
  // import("../data/playerNames.json", { assert: { type: "json" } }),
  null,
  import("../../data/autoKickWords.json", { with: { type: "json" } }),
  import("../../data/bingoBrewersRules.json", { with: { type: "json" } }),
);

export { utils };