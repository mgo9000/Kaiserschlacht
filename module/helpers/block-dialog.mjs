export async function blockDialog() {
  const blockMod = await Dialog.wait({
    title: "Block Dialog",
    content: "Choose the method of blocking.",
    buttons: {
      one: {
        label: "Standard Weapon", callback: () => {
          const blockMod = 1;
          return blockMod;
        }
      },
      two: {
        label: "Parrying Weapon", callback: () => {
          const blockMod = 2;
          return blockMod;
        }
      },
      three: {
        label: "Blocking Weapon", callback: () => {
          const blockMod = 3;
          return blockMod;
        }
      },


    },
  });
  return blockMod;

}