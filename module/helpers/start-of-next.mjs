export default function startOfNext() {
  const cbt = game.combat;
  if (cbt) {
    const c = {
      round: cbt.round ?? 0,
      turn: cbt.turn ?? 0,
      nTurns: cbt.turns.length || 1,
    };
    console.log(c);
    const newDTurns = c.nTurns - (c.turn + 1);
    return newDTurns;
  }
}
