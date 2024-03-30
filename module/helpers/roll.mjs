/**
 * @param {string} formula                       The string formula to parse
 * @param {object} data                          The data object which attribute values are taken from
 * @param {object} [options={}]                 Options which modify or describe the Roll
 * @param {object} [options.targetedToken]   The token which is provided as a target.
 * @param {boolean} [options.diffRoll]   Whether or not it is a roll against a difficulty die.
 */
export class KSRoll extends Roll {
   /** @override */
   static CHAT_TEMPLATE = "systems/kaiserschlacht/templates/chat/roll.hbs";
   /* -------------------------------------------- */

   /**
    * Return the target number from the data of a targetted token.
    * @type {string}
    */
   get targetNumber() {
      return messageData.rolls.targetNumber = game.user.targets.first()?.document.actor.system.targetNumber ?? null;
   }
   /** @inheritdoc */
   async toMessage(messageData = {}, options = {}) {
      return super.toMessage(messageData, options);
   }
}

