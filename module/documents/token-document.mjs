import * as helpers from "../helpers/_module.mjs";
/* -------------------------------------------- */
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {TokenDocument}
 */
export default class KSTokenDocument extends TokenDocument {
  /**
   * A helper function to toggle a status effect which includes an Active Effect template
   * @param {{id: string, label: string, icon: string, changes: array duration:array}} effectData The Active Effect data
   * @param {object} [options]                                     Options to configure application of the Active Effect
   * @param {boolean} [options.overlay=false]                      Should the Active Effect icon be displayed as an
   *                                                               overlay on the token?
   * @param {boolean} [options.active]                             Force a certain active state for the effect.
   * @returns {Promise<boolean>}      Whether the Active Effect is now on or off
   * @override
   */
  async toggleActiveEffect(effectData, { overlay = false, active } = {}) {
    if (!this.actor || !effectData.id) return false;
    // Remove existing single-status effects.
    const existing = this.actor.effects.reduce((arr, e) => {
      if (e.statuses.size === 1 && e.statuses.has(effectData.id))
        arr.push(e.id);

      return arr;
    }, []);
    const state = active ?? !existing.length;
    if (!state && existing.length)
      await this.actor.deleteEmbeddedDocuments("ActiveEffect", existing);
    // Add a new effect
    else if (state) {
      const cls = getDocumentClass("ActiveEffect");
      const createData = foundry.utils.deepClone(effectData);
      createData.statuses = [effectData.id];
      delete createData.id;
      cls.migrateDataSafe(createData);
      cls.cleanData(createData);
      createData.name = game.i18n.localize(createData.name);
      if (overlay) createData["flags.core.overlay"] = true;
      await cls.create(createData, { parent: this.actor });
    }
    return state;
  }
}
