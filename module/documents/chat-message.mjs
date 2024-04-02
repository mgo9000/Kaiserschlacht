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
    html.querySelectorAll(".undo-damage-button").forEach(el => el.addEventListener("click", this._onClickUndoDamage.bind(this)));
  }
  _onClickApplyDamage(event) {
    event.preventDefault();
    const a = event.currentTarget
    let dataset = a.dataset;
    const targetTokens = canvas.tokens.controlled;
    if (targetTokens.length <= 0) ui.notifications.warn("You must select a target first.");
    for (let token of targetTokens) {
      token.actor._applyDamage(dataset.damage, dataset.damageTags);
    }

  }
  _onClickChatReload(event) {
    event.preventDefault();
    const a = event.currentTarget
    let dataset = a.dataset;

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
  // undo damage
  async _onClickUndoDamage(event) {
    event.preventDefault();
    console.log(event);
    console.log(event.currentTarget.parentNode);
    console.log(event.currentTarget.firstChild);
    const a = event.currentTarget
    console.log(a);
    let dataset = a.dataset;
    const uuid = dataset.uuid;
    let actor = await fromUuid(uuid);
    const originalHealth = dataset.originalHealth;
    const originalArmor = dataset.armor;
    actor.update({ system: { health: { value: originalHealth } } });
    actor.update({ system: { armor: originalArmor } });
    ui.notifications.info(`Damage to ${actor.name} reverted.`);
    a.remove();


  }
}