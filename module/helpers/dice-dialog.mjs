export async function diffDialog(formula){
const diffMod = await Dialog.wait({
    title: "Difficulty Dialog",
    content: "Select the difficulty die.",
    buttons: {
        one: { icon: '<class="roll die d4">',
        label: "d4", callback: () => {
            const diffMod = " - 1d4[diff.]"
            return diffMod;
      }},
      two: { icon: '<class="roll die d6">',
        label: "d6", callback: () => {
            const diffMod = " - 1d6[diff.]"
            return diffMod;
      }},
      three: { icon: '<class="roll die d8">',
        label: "d8", callback: () => {
            const diffMod = " - 1d8[diff.]"
            return diffMod;
      }},
      four: { icon: '<class="roll die d10">',
        label: "d10", callback: () => {
            const diffMod = " - 1d10[diff.]"
            return diffMod;
      }},
      five: { icon: '<class="roll die d12">',
        label: "d12", callback: () => {
            const diffMod = " - 1d12[diff.]"
            return diffMod;
      }},
      
    },
  });
    let amendedFormula = (formula + diffMod);
      return amendedFormula;
  
}