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
    html.querySelector(".reload-button").addEventListener("click", this._onCLickApplyDamage.bind(this));
    html.querySelector(".reload-button").addEventListener("click", this._onClickChatReload.bind(this));
    return html;
  }
  _onCLickApplyDamage(event) {
    event.preventDefault();
    let dataset = event.dataset;
    const targetTokens = canvas.tokens.controlled;


  }
  _onClickChatReload(event) {
    event.preventDefault();
    let dataset = event.dataset;
    const speaker = super.getSpeaker({ actor: this.actor });
    console.log(this.actor);
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