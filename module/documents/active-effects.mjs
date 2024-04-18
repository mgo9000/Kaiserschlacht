/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class KSActiveEffect extends ActiveEffect {
  /**
   * Changes the duration of effects meant to expire on one's next turn.
   * @override
   */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
  }

  /**
   * @override
   */
  _onDelete(options, userId) {
    console.log(arguments);
    console.log(this);
    if (this.modifiesActor) {
      if (this.flags.onRemove) {
        const actor = this.target;
        const onRemoveFunc = this.flags.onRemove;
        const onRemoveArgs = this.flags.onRemoveArgs;
        switch (onRemoveFunc) {
          case "toggleTokenStatus":
            const actorTokens = actor.getActiveTokens(true, true);
            actorTokens.forEach((token) =>
              token.toggleActiveEffect(
                CONFIG.statusEffects.find((e) => e.id === onRemoveArgs.id)
              )
            );
            break;
          default:
            break;
        }
      }
    }
    super._onDelete(options, userId);
  }
}
