class KSHotbar extends hotbar {
    constructor(options) {
        super(options);
    }
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

        // Get the Macro to add to the bar
        let macro;
        if (data.type === "Macro") macro = game.macros.has(doc.id) ? doc : await cls.create(doc.toObject());
        else if (data.type === "RollTable") macro = await this._createRollTableRollMacro(doc);
        else if (data.type === "weapon") macro = await this.createItemMacro(data, slot);
        else if (data.type === "Item") macro = await this.createItemMacro(data, slot);
        else macro = await this._createDocumentSheetToggle(doc);

        // Assign the macro to the hotbar
        if (!macro) return;
        return game.user.assignHotbarMacro(macro, slot, { fromSlot: data.slot });
    }
}