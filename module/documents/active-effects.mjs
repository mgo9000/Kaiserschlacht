/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class KSActiveEffect extends ActiveEffect {
  /**
   * Manages the duration of a given effect, signaling to remove it if expired.
   */
  async manageDuration(document, changes, options, userId) {
    const effect = document;
    if (document.duration.remaining <= 0) {
    }
  }

  /**
   * Update derived Active Effect duration data.
   * Configure the remaining and label properties to be getters which lazily recompute only when necessary.
   * @override
   * @returns {ActiveEffectDuration}
   */
  updateDuration() {
    console.log(this.duration);
    const { remaining, label, ...durationData } = this._prepareDuration();
    console.log(remaining);
    console.log(label);
    console.log(durationData);
    Hooks.callAll("updateDuration");
    return super.updateDuration();
  }
}
