import {
  KSRoll,
} from '../helpers/roll.mjs';
/**
* Extend the base ChatMessage document
* @extends {ChatMessage}
*/
export class KSChatMessage extends ChatMessage {
  /** @inheritDoc */
  async getHTML(...args) {
    const html = await super.getHTML();
    console.log(html);
    this._configureButtons(html[0]);
    return html;
  }
  _configureButtons(html) {
    html.querySelectorAll(".apply-damage-button").forEach(el => el.addEventListener("click", this._onClickApplyDamage.bind(this)));
    html.querySelectorAll(".reload-button").forEach(el => el.addEventListener("click", this._onClickChatReload.bind(this)));
  }
  _onClickApplyDamage(event) {
    event.preventDefault();
    let dataset = event.dataset;
    const targetTokens = canvas.tokens.controlled;


  }
  _onClickChatReload(event) {
    event.preventDefault();
    let dataset = event.dataset;
    const speaker = KSChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const roll = new KSRoll("1d6", dataset, { targetNumber: dataset.reload });
    roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: "Reload",
    });
    return roll;

  }
}