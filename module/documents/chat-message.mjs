/**
* Extend the base ChatMessage document
* @extends {ChatMessage}
*/
export class KSChatMessage extends ChatMessage {
  /** @inheritDoc */
  async getHTML(...args) {
    const html = await super.getHTML();
    html.on('click', '.apply-damage-button', (ev) => {
      console.log("clicked damage button");
      console.log(ev);
    });
    html.on('click', '.reload-button', (ev) => {
      console.log("clicked reload button");
      chatReload(ev);
    });
    return html;
  }
  applyDamage(event) {
    event.preventDefault();
    let dataset = event.dataset;
    const targetTokens = canvas.tokens.controlled;


  }
  chatReload(event) {
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