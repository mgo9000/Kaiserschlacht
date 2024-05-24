export default function startOfNext() {
  const cbt = game.combat;
  if (cbt) {
    const c = {
      round: cbt.round ?? 0,
      turn: cbt.turn ?? 0,
      nTurns: cbt.turns.length || 1,
    };
    console.log(c);
    const newDTurns = c.nTurns - c.turn;
    const newDTime = Math.max(newDTurns / 100, 0);
    const newRemaining = Math.max(newDTurns / 100, 0);
    const newLabel = `${newDTurns} ${game.i18n.localize(
      newDTurns === 1 ? "COMBAT.Turn" : "COMBAT.Turns"
    )}`;

    console.log(newDTurns);
    return {
      turns: newDTurns,
      duration: newDTime,
      remaining: newRemaining,
      label: newLabel,
    };
  } else {
    const roundLabel = `1 ${game.i18n.localize("COMBAT.Round")}`;
    console.log(roundLabel);
    return {
      duration: 1,
      rounds: 1,
      label: roundLabel,
      type: "rounds",
    };
  }
}
