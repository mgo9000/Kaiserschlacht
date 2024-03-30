/**
 * @param {string} formula                       The string formula to parse
 * @param {object} data                          The data object which attribute values are taken from
 * @param {object} [options={}]                 Options which modify or describe the Roll
 * @param {object} [options.targetedToken]   The token which is provided as a target.
 * @param {number} [options.targetNumber]   the target number of a check, if provided
 * @param {number} [options.damage=null]   the damage, if provided
 * * @param {number} [options.reload=null]   the reload target, if provided
 * @param {string} [options.damageTags=null]   the tags for the damage to be applied, if provided
 */
export class KSRoll extends Roll {
   constructor(formula, data, options) {
      super(formula, data, options);
      console.log(this.options.targetNumber);
      if (this.options.targetNumber === undefined) {this.configureTargetNumber();}
    }
   /** @override */
   static CHAT_TEMPLATE = "systems/kaiserschlacht/templates/chat/roll.hbs";
   /* -------------------------------------------- */

   /**
    * Return the target number from the data of a targetted token.
    * @type {number}
    */
   configureTargetNumber() {
      this.options.targetNumber = game.user.targets.first()?.document.actor.system.targetNumber ?? null;
   }


   /** @inheritdoc */
   async toMessage(messageData = {}, options = {}) {
      return super.toMessage(messageData, options);
   }
   async getDegreeOfSuccess() {
      if ( !this._evaluated ) await this.evaluate({async: true});
      console.log(this.options.targetNumber);
      if (this.options.targetNumber === null){
         return null;
      }
      else{
         const degreeOfSuccess = this.total >= this.options.targetNumber ? true : false;
         console.log(degreeOfSuccess);
         return degreeOfSuccess;
      }
   }
     /* -------------------------------------------- */

  /**
   * Render a Roll instance to HTML
   * @override
   * @param {object} [options={}]               Options which affect how the Roll is rendered
   * @param {string} [options.flavor]             Flavor text to include
   * @param {string} [options.template]           A custom HTML template path
   * @param {boolean} [options.isPrivate=false]   Is the Roll displayed privately?
   * @returns {Promise<string>}                 The rendered HTML template as a string
   */
  async render({flavor, template=this.constructor.CHAT_TEMPLATE, isPrivate=false}={}) {
   if ( !this._evaluated ) await this.evaluate({async: true});
   const chatData = {
     formula: isPrivate ? "???" : this._formula,
     flavor: isPrivate ? null : flavor,
     targetNumber: isPrivate ? null : this.options.targetNumber,
     damage: isPrivate ? null : this.options.damage,
     damageTags: isPrivate ? null : this.options.damageTags,
     degreeOfSuccess: isPrivate ? null : await this.getDegreeOfSuccess(),
     user: game.user.id,
     tooltip: isPrivate ? "" : await this.getTooltip(),
     total: isPrivate ? "?" : Math.round(this.total * 100) / 100
   };
   return renderTemplate(template, chatData);
 }
}

