

/**
 * Extend the base Hotbar document to handle macro dragging more effectl.
 * @extends {Hotbar}
 */
export class KSHotbar extends Hotbar {
    /** @override */
    async _onDrop(event) {
        event.preventDefault();
        const li = event.target.closest(".macro");
        const slot = Number(li.dataset.slot);
        const data = TextEditor.getDragEventData(event);
        if (Hooks.call("hotbarDrop", this, data, slot) === false) return;

        // Forbid overwriting macros if the hotbar is locked.
        const existingMacro = game.macros.get(game.user.hotbar[slot]);
        if (existingMacro && this.locked) return ui.notifications.warn("MACRO.CannotOverwrite", { localize: true });

        // Get the dropped document
        const cls = getDocumentClass(data.type);
        const doc = await cls?.fromDropData(data);
        if (!doc) return;

        return;

    }

}