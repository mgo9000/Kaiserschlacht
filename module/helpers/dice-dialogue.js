
export async function diffRoll(formula, actorObject, labelfromSheet){
const diffMod = await Dialog.wait({
    title: "Difficulty Dialog",
    content: "Select the difficulty die.",
    buttons: {
        one: { icon: '<i class="roll die d4"></i>',
        label: "d4", callback: () => {
            const diffMod = " - 1d4"
            return diffMod;
      }},
      two: { icon: '<i class="roll die d6"></i>',
        label: "d6", callback: () => {
            const diffMod = " - 1d6"
            return diffMod;
      }},
      three: { icon: '<i class="roll die d8"></i>',
        label: "d8", callback: () => {
            const diffMod = " - 1d8"
            return diffMod;
      }},
      four: { icon: '<i class="roll die d6"></i>',
        label: "d10", callback: () => {
            const diffMod = " - 1d10"
            return diffMod;
      }},
      five: { icon: '<i class="roll die d6"></i>',
        label: "d12", callback: () => {
            const diffMod = " - 1d12"
            return diffMod;
      }},
      
    },
  });
    let amendedFormula = (formula + diffmod);
    let label = labelfromSheet;
      let roll = new Roll(amendedFormula, actorObject.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actorObject }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
  
}