/**
 * An extension of the core Combat document adding new tools for use with Kaiserschlacht.
 * @extends {Combat}
 */
export default class KSCombat extends Combat {
  removeExpiredEffects() {
    this.combatants.forEach((combatant) => {
      const effectCollection =
        combatant.actor?.getEmbeddedCollection("effects");
      effectCollection.forEach((effect) => {
        if (effect.duration.remaining <= 0) {
          effect.delete();
        }
      });
    });
  }
}
