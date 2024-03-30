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
      });
    return html;
  }
}