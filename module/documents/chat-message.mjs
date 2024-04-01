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
      console.log(ev);
    });
    return html;
  }
  async chatReload(event) {
    event.preventDefault();


  }
}