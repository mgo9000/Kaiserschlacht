
export async function diffRoll(formula, actorObject, labelfromSheet){
const diffMod = await Dialog.wait({
    title: "Difficulty Dialog",
    content: "Select the difficulty die.",
    buttons: {
        one: { icon: '<class="roll die d4">',
        label: "d4", callback: () => {
            const diffMod = " - 1d4[difficulty]"
            return diffMod;
      }},
      two: { icon: '<class="roll die d6">',
        label: "d6", callback: () => {
            const diffMod = " - 1d6[difficulty]"
            return diffMod;
      }},
      three: { icon: '<class="roll die d8">',
        label: "d8", callback: () => {
            const diffMod = " - 1d8[difficulty]"
            return diffMod;
      }},
      four: { icon: '<class="roll die d10">',
        label: "d10", callback: () => {
            const diffMod = " - 1d10[difficulty]"
            return diffMod;
      }},
      five: { icon: '<class="roll die d12">',
        label: "d12", callback: () => {
            const diffMod = " - 1d12[difficulty]"
            return diffMod;
      }},
      
    },
  });
    let amendedFormula = (formula + diffMod);
    let label = labelfromSheet;
      let roll = new Roll(amendedFormula, actorObject.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actorObject }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
  
}