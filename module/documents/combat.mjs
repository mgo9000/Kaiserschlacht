/**
 * An extension of the core Combat document adding new tools for use with Kaiserschlacht.
 * @extends {Combat}
 */
export default class KSCombat extends Combat {
  removeExpiredEffects() {
    this.combatants.forEach((combatant) => {
      console.log(this);
      const effectCollection =
        combatant.actor?.getEmbeddedCollection("effects");
      const effectClone = foundry.utils.deepClone(effectCollection);
      effectClone?.forEach((effect) => {
        if (effect.duration.remaining <= 0) {
          effect.delete();
        }
        combatant.actor?.update({ effects: effectClone });
      });
    });
  }
}
