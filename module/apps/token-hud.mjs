/**
 * Extending TokenHud
 * @extends {TokenHUD}
 */
export class KSTokenHUD extends TokenHUD {
    /* -------------------------------------------- */

    /**
     * Handle toggling a token status effect icon
     * @param {PointerEvent} event      The click event to toggle the effect
     * @param {object} [options]        Options which modify the toggle
     * @param {boolean} [options.overlay]   Toggle the overlay effect?
     * @private
     */
    _onToggleEffect(event, { overlay = false } = {}) {
        event.preventDefault();
        event.stopPropagation();
        let img = event.currentTarget;
        const effect = (img.dataset.statusId && this.object.actor) ?
            CONFIG.statusEffects.find(e => e.id === img.dataset.statusId) :
            img.getAttribute("src");
        return this.object.toggleEffect(effect, { overlay });
    }


}