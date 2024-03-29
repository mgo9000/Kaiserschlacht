/**
 * @param {string} formula                       The string formula to parse
 * @param {object} data                          The data object which attribute values are taken from
 * @param {object} [options={}]                 Options which modify or describe the Roll
 * @param {object} [options.targetedToken]   The token which is provided as a target.
 * @param {boolean} [options.diffRoll]   Whether or not it is a roll against a difficulty die.
 */
export class KSRoll extends Roll{
/** @override */
static CHAT_TEMPLATE = "systems/kaiserschlacht/templates/chat/roll.hbs";

 /** @inheritdoc */
 async toMessage(messageData={}, options={}) {
   if ( !this._evaluated ) await this.evaluate({async: true});
   messageData.rolls = [this];
   messageData.rolls.targetNumber = game.user.targets.first()?.document.actor.system.targetNumber ?? null;
   console.log(game.user.targets.first() ?? null);
   console.log(messageData.rolls.targetNumber);
    return super.toMessage(messageData, options);
 }
}

