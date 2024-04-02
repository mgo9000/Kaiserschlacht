class KSHotbar extends Hotbar {
    constructor(options) {
        super(options);
        game.macros.apps.push(this);
        /**
             * The currently viewed macro page
             * @type {number}
             */
        this.page = 1;

        /**
         * The currently displayed set of macros
         * @type {Macro[]}
         */
        this.macros = [];

        /**
         * Track collapsed state
         * @type {boolean}
         */
        this._collapsed = false;

        /**
         * Track which hotbar slot is the current hover target, if any
         * @type {number|null}
         */
        this._hover = null;
    }

    /* -------------------------------------------- */

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "hotbar",
            template: "templates/hud/hotbar.html",
            popOut: false,
            dragDrop: [{ dragSelector: ".macro-icon", dropSelector: "#macro-list" }]
        });
    }

    /* -------------------------------------------- */

    /**
    * Whether the hotbar is locked.
    * @returns {boolean}
    */
    get locked() {
        return game.settings.get("core", "hotbarLock");

    }
    /** @override */
    getData(options = {}) {
        super.getData(options);
    };

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