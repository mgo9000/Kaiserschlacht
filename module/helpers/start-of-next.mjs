import KSActiveEffect from "../documents/active-effects.mjs";
export default function startOfNext() {
  const cbt = game.combat;
  if (cbt) {
    const c = {
      round: cbt.round ?? 0,
      turn: cbt.turn ?? 0,
      nTurns: cbt.turns.length || 1,
    };
    console.log(c);
    const newDTurns = c.nTurns - (c.turn - 1);
    const newDTime = KSActiveEffect._getCombatTime(0, newDTurns);
    const newRemaining = KSActiveEffect._getCombatTime(0, newDTurns);
    const newLabel = KSActiveEffect._getDurationLabel(0, newDTurns);

    console.log(newDTurns);
    return [newDTurns, newDTime, newRemaining, newLabel];
  }
}
