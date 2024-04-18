/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 * @extends {ActiveEffect}
 */
export default class KSActiveEffect extends ActiveEffect {
  /** @override */
  async _preCreate(data, options, user) {
    // Set initial duration data for Actor-owned effects
    if (this.parent instanceof Actor) {
      let updates = this.constructor.getInitialDuration();

      for (const k of Object.keys(updates.duration)) {
        if (Number.isNumeric(data.duration?.[k])) delete updates.duration[k]; // Prefer user-defined duration data
      }
      if (data.flags.startOfNext) {
        console.log("applying start of next turn duration adjustment");
        console.log;
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
          const start = this._getCombatTime(
            d.startRound,
            d.startTurn,
            c.nTurns
          );
          const durationLabel = this._getDurationLabel(0, newDTurns);
          console.log(durationLabel);
          const remaining = Math.max(
            (start + duration - current).toNearest(0.01),
            0
          );
          updates = {
            duration: {
              type: "turns",
              remaining: remaining,
              label: durationLabel,
              duration: duration,
            },
          };
        }
        updates.transfer = false;
        this.updateSource(updates);
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
