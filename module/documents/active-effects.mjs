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
    console.log(this);
    if (this.flags.startOfNext) {
      await super._preCreate(data, options, user);
      console.log("applying start of next turn duration adjustment");
      const cbt = game.combat;
      const d = this.duration;
      console.log(d);
      if (cbt) {
        const c = {
          round: cbt.round ?? 0,
          turn: cbt.turn ?? 0,
          nTurns: cbt.turns.length || 1,
        };
        console.log(c);
        const newDTurns = c.nTurns - c.turn;
        const current = this._getCombatTime(c.round, c.turn);
        const duration = this._getCombatTime(0, newDTurns);
        console.log(duration);
        const start = this._getCombatTime(d.startRound, d.startTurn, c.nTurns);
        const durationLabel = this._getDurationLabel(0, newDTurns);
        const remaining = Math.max(
          (start + duration - current).toNearest(0.01),
          0
        );
        this.updateSource({
          duration: {
            type: "turns",
            remaining: remaining,
            label: durationLabel,
            duration: duration,
          },
        });
        console.log(this);
      }
    }
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
