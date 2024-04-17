/**
 * An extension of the core Combat document adding new tools for use with Kaiserschlacht.
 * @extends {Combat}
 */
export default class KSCombat extends Combat {
  removeExpiredEffects() {
    let combatants = this.combatants;
    combatants.forEach((combatant) => {
      console.log(this);
      let effectCollection = combatant.actor?.effects;
      let effectClone = foundry.utils.deepClone(effectCollection);
      effectClone?.forEach((effect) => {
        if (effect.duration.remaining <= 0) {
          effect.delete();
        }
        foundry.utils.mergeObject(effectCollection, effectClone, {
          overwrite: true,
        });
      });
    });
  }
}
