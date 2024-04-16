/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export class KSActiveEffect extends ActiveEffect {
  /* -------------------------------------------- */

  /**
   * Create an ActiveEffect instance from some status effect ID.
   * Delegates to {@link ActiveEffect._fromStatusEffect} to create the ActiveEffect instance
   * after creating the ActiveEffect data from the status effect data if `CONFIG.statusEffects`.
   * @param {string} statusId                             The status effect ID.
   * @param {DocumentModificationContext} [options={}]    Additional options to pass to ActiveEffect instantiation.
   * @returns {Promise<ActiveEffect>}                     The created ActiveEffect instance.
   * @throws    An error if there's not status effect in `CONFIG.statusEffects` with the given status ID,
   *            and if the status has implicit statuses but doesn't have a static _id.
   */
  static async fromStatusEffect(statusId, options = {}) {
    // TODO: This function has been copy & pasted from V12. Remove it once V11 support is dropped.

    const status = CONFIG.statusEffects.find((e) => e.id === statusId);
    if (!status)
      throw new Error(
        `Invalid status ID "${statusId}" provided to ActiveEffect.fromStatusEffect`
      );
    if (foundry.utils.isNewerVersion(game.version, 12)) {
      for (const [oldKey, newKey] of Object.entries({
        label: "name",
        icon: "img",
      })) {
        if (!(newKey in status) && oldKey in status) {
          const msg = `StatusEffectConfig#${oldKey} has been deprecated in favor of StatusEffectConfig#${newKey}`;
          foundry.utils.logCompatibilityWarning(msg, {
            since: 12,
            until: 14,
            once: true,
          });
        }
      }
    }
    const { id, label, icon, hud, ...effectData } =
      foundry.utils.deepClone(status);
    effectData.name = game.i18n.localize(effectData.name ?? label);
    if (game.release.generation < 12) effectData.icon ??= icon;
    else effectData.img ??= icon;
    effectData.statuses = Array.from(
      new Set([id, ...(effectData.statuses ?? [])])
    );
    if (effectData.statuses.length > 1 && !status._id) {
      throw new Error(
        "Status effects with implicit statuses must have a static _id"
      );
    }
    return ActiveEffect.implementation._fromStatusEffect(
      statusId,
      effectData,
      options
    );
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static async _fromStatusEffect(statusId, effectData, options) {
    delete effectData.reference;
    return (
      super._fromStatusEffect?.(statusId, effectData, options) ??
      new this(effectData, options)
    );
  }

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
