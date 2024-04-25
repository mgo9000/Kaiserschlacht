import { Sortable } from "../../lib/sortable.core.esm.js";
/**
 * Application responsible for tracking combatants in initiative.
 *
 * @export
 * @class KSCombatTracker
 * @typedef {KSCombatTracker}
 * @extends {CombatTracker}
 */
export default class KSCombatTracker extends CombatTracker {
  /** @override */
  activateListeners(jquery) {
    super.activateListeners(jquery);
    const html = jquery[0];
    const tracker = html.querySelector("#combat-tracker");
    if (this.viewed) {
      const trackerCombatants = tracker.querySelectorAll("li.combatant");
      for (const combatantRow of trackerCombatants) {
        const id = combatantRow.dataset.combatantId ?? "";
        const combatantDoc = this.viewed.combatants?.get(id, { strict: true });
        combatantRow.dataset.initiative = combatantDoc.initiative?.toString();
        combatantRow.classList.add("gm-user-draggable");
        const combatantType = combatantDoc.actor.type;
        const initiativeSpan = combatantRow.querySelector("span.initiative");
        initiativeSpan.innerHTML = game.i18n.localize(
          `KAISERSCHLACHT.Actor.${combatantType}.abbr`
        );
      }
    }
    if (game.user.isGM) {
      Sortable.create(tracker, {
        animation: 100,
        dataIdAttr: "data-combatant-id",
        direction: "vertical",
        dragClass: "drag-preview",
        dragoerBubble: "true",
        ghostClass: "drag-gap",
        onUpdate: () => this.adjustOrder(),
      });

      return;
    }
  }
  async adjustOrder() {
    const currentOrder = this.getDOMCombatants();
    currentOrder.forEach((combatant, index) => {
      if (combatant.initiative) {
        combatant.initiative = currentOrder.length - index;
      }
    });

    await this.viewed?.updateEmbeddedDocuments(
      "Combatant",
      currentOrder.map((combatant) => ({
        _id: combatant.id,
        initiative: combatant.initiative,
      }))
    );
  }
  /**
   * Gets the combatants
   *
   * @returns {array}
   */
  getDOMCombatants() {
    const tracker = this.element[0].querySelector("#combat-tracker");
    return Array.from(tracker.querySelectorAll("li.combatant"))
      .map(
        (combatantRow) => combatantRow.getAttribute("data-combatant-id") ?? ""
      )
      .map((id) => game.combat.combatants.get(id, { strict: true }))
      .filter((combatant) => combatant.initiative);
  }
}
