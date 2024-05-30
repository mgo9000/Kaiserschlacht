// Import application classes.
// import { KSHotbar } from './applications/hotbar.mjs';
//import submodules
import * as documents from "./documents/_module.mjs";
import * as apps from "./apps/_module.mjs";
// Import document classes.
import { KSActor } from "./documents/actor.mjs";
import { KSItem } from "./documents/item.mjs";
import { KSChatMessage } from "./documents/chat-message.mjs";
// Import sheet classes.
import { KSActorSheet } from "./sheets/actor-sheet.mjs";
import { KSItemSheet } from "./sheets/item-sheet.mjs";

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { KSRoll } from "./helpers/roll.mjs";
import { KAISERSCHLACHT } from "./helpers/config.mjs";
import * as helpers from "./helpers/_module.mjs";
import { registerSettings } from "./settings.mjs";
globalThis.kaiserschlacht = {
  KSActor,
  KSItem,
  rollItemMacro,
  createItemMacro,
  documents,
  helpers,
  apps,
  KSChatMessage,
  KSRoll,
  config: KAISERSCHLACHT,
};
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function() {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  registerSettings();
  globalThis.kaiserschlacht = game.kaiserschlacht = Object.assign(
    game.system,
    globalThis.kaiserschlacht
  );
  // Add custom constants for configuration.
  CONFIG.KAISERSCHLACHT = KAISERSCHLACHT;

  CONFIG.weaponTagWhitelist = [
    "2 Target",
    "3 Target",
    "AP",
    "Awesome",
    "Bayonet",
    "Blast 1",
    "Blast 2",
    "Blast 3",
    "Block",
    "Bonk",
    "Breaching 1",
    "Breaching 2",
    "Breaching 3",
    "Cobbled",
    "Combo",
    "Deployed",
    "Double-Barrel",
    "Fast",
    "Heavy",
    "Illuminating 1",
    "Illuminating 2",
    "Illuminating 3",
    "Lasting",
    "Parry",
    "Piercing",
    "Rapid-Fire",
    "Reach",
    "Scoped",
    "Signal",
    "Slam-Fire",
    "Slow",
    "Smokescreen",
    "Squad",
    "Stream",
    "Terror",
    "Unwieldy",
    "Utility",
  ];
  /**
   * An array of status effects which can be applied to a TokenDocument.
   * Each effect can either be a string for an icon path, or an object representing an Active Effect data.
   * @override
   * @type {Array<string|ActiveEffectData>}
   */
  CONFIG.statusEffects = [
    {
      id: "dead",
      name: "EFFECT.StatusDead",
      icon: "icons/svg/skull.svg",
    },
    {
      id: "fading",
      name: "Fading",
      icon: "icons/svg/unconscious.svg",
    },
    {
      id: "cover",
      name: "Cover",
      icon: "icons/svg/tower.svg",
      changes: [{ key: "system.tempArmor", value: 2 }],
      duration: { rounds: 0 },
      flags: { startOfNext: true },
    },
    {
      id: "prone",
      name: "EFFECT.StatusProne",
      icon: "icons/svg/falling.svg",

      changes: [{ key: "system.tempArmor", value: 1 }],
    },
  ];
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@initiative",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = KSActor;
  CONFIG.Item.documentClass = KSItem;
  CONFIG.ChatMessage.documentClass = KSChatMessage;
  CONFIG.ActiveEffect.documentClass = documents.KSActiveEffect;
  CONFIG.Combat.documentClass = documents.KSCombat;
  // CONFIG.Token.documentClass = documents.KSTokenDocument;
  // CONFIG.ui.hotbar = KSHotbar;
  CONFIG.ui.combat = apps.KSCombatTracker;

  // Define and push custom dice types
  CONFIG.Dice.KSRoll = KSRoll;
  CONFIG.Dice.rolls.push(KSRoll);
  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("kaiserschlacht", KSActorSheet, {
    makeDefault: true,
    label: "KAISERSCHLACHT.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("kaiserschlacht", KSItemSheet, {
    makeDefault: true,
    label: "KAISERSCHLACHT.SheetLabels.Item",
  });
  if (document.querySelector("#ui-top")) {
    const uiTop = document.querySelector("#ui-top");
    const effectBarElement = document.createElement("template");
    effectBarElement.setAttribute("id", "effect-bar");
    uiTop.insertAdjacentElement("afterend", effectBarElement);
  }
  game.kaiserschlacht.effectBar = new apps.EffectBar();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper("toLowerCase", function(str) {
  return str.toLowerCase();
});
Handlebars.registerHelper("json", (data) => {
  return JSON.stringify(data);
});
Handlebars.registerHelper("values", (data) => {
  return Object.values(data);
});
/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  //Effects Bar
  game.kaiserschlacht.effectBar.render(true);
  console.log(ui);
  Hooks.on("dropActorSheetData", (actor, sheet, data) => {
    if (data.type == "Item"){
      const item = fromUuidSync(data.uuid);
      if (item.type != "feature"  && item.parent != actor){
        deleteOriginalItem(item);
      }
    }
  });
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (["Item"].includes(data.type)) {
      createItemMacro(data, slot);
      return false;
    }
  });
  Hooks.on("controlToken", (object, controlled) => {
    console.log("controlToken hook fired");
    game.kaiserschlacht.effectBar.render();
  });
  Hooks.on(
    "preUpdateCombat",
    async (combat, updateData, updateOptions, advanceTime) => {
      for (let combatant of combat.combatants) {
        if (combatant.actor) {
          combatant.actor.removeExpiredEffects();
        }
      }
      return true;
    }
  );
  Hooks.on("updateActor", (actor, changes, options, userId) => {
    if (game.user.isGM) {
      if (changes.system.health?.value === 0) {
        actor.dropFadingOrDead();
      }
    }
  });
  Hooks.on("preCreateCombatant", (combatant, data, options, userId) => {
    console.log(combatant);
    const newInitiative = combatant.actor.system.initiative;
    console.log(newInitiative);
    combatant.updateSource({ initiative: newInitiative });
  });
  // Hooks.on("applyActiveEffect", (actor, change, current, delta, changes) => {
  //   console.log(change);
  //   console.log(current);
  //   console.log(delta);
  //   console.log(changes);
  //   return true;
  // });
  //dice so nice special color for difficulty dice
  Hooks.once("diceSoNiceReady", (dice3d) => {
    dice3d.addColorset({
      name: "diff",
      description: "Difficulty dice.",
      category: "Colors",
      foreground: "#ffe436",
      background: "#000000",
      outline: "black",
      texture: "none",
      material: "plastic",
    });
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @returns {Promise}
 */
export async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  console.log(data.type);
  if (data.type !== "Item") {
    console.log("Wrong type for making macros.");
    return;
  }
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.implementation.fromDropData(data);
  // Create the macro command using the uuid.
  const command = `game.kaiserschlacht.rollItemMacro("${data.uuid}");`;
  const macro =
    game.macros.find((m) => m.name === item.name && m.command === command) ||
    (await Macro.create({
      name: item.name,
      type: "script",
      scope: "actor",
      img: item.img,
      command: command,
      flags: { "kaiserschlacht.itemMacro": true },
    }));
  game.user.assignHotbarMacro(macro, slot);
  return;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
export function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  KSItem.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }
    if (item.type == "weapon") {
      item.attackRoll();
    } else {
      // Trigger the item roll
      item.roll();
    }
  });
}
export function deleteOriginalItem(item) {
  if (!item.compendium && item.isOwned){
    item.delete();
  }
}