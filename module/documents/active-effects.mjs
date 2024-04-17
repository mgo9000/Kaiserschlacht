/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class KSActiveEffect extends ActiveEffect {
  /**
   * @override
   */
  _onDelete(options, userId) {
    console.log(arguments);
    console.log(this);
    if (this.modifiesActor) {
      if (this.onRemove) {
        this.target[onRemove];
      }
    }
    super._onDelete(options, userId);
  }
}
