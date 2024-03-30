/**
* Extend the base ChatMessage document
* @extends {ChatMessage}
*/
export class KSChatMessage extends ChatMessage {
    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        html.on('click', '.apply-damage-button', (ev) => {
            console.log("damage button clicked")
        });
        html.on('click', '.reload-button', (ev) => {
            console.log("reload button clicked")
        });
    }


}