// Import document classes.
import { KSActor } from './documents/actor.mjs';
import { KSItem } from './documents/item.mjs';
import { KSChatMessage } from './documents/chat-message.mjs';
// Import sheet classes.
import { KSActorSheet } from './sheets/actor-sheet.mjs';
import { KSItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { KSRoll } from './helpers/roll.mjs';
import { KAISERSCHLACHT } from './helpers/config.mjs';
globalThis.kaiserschlacht = {
  KSActor,
  KSItem,
  rollItemMacro,
  KSChatMessage,
  KSRoll,
  config: KAISERSCHLACHT
};
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.

  globalThis.kaiserschlacht = game.kaiserschlacht = Object.assign(game.system, globalThis.kaiserschlacht);
  // Add custom constants for configuration.
  CONFIG.KAISERSCHLACHT = KAISERSCHLACHT;
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
      icon: "icons/svg/skull.svg"
    },
    {
      id: "unconscious",
      name: "EFFECT.StatusUnconscious",
      icon: "icons/svg/unconscious.svg"
    },
    {
      id: "sleep",
      name: "EFFECT.StatusAsleep",
      icon: "icons/svg/sleep.svg"
    },
    {
      id: "stun",
      name: "EFFECT.StatusStunned",
      icon: "icons/svg/daze.svg"
    },
    {
      id: "prone",
      name: "EFFECT.StatusProne",
      icon: "icons/svg/falling.svg"
    },
    {
      id: "restrain",
      name: "EFFECT.StatusRestrained",
      icon: "icons/svg/net.svg"
    },
    {
      id: "paralysis",
      name: "EFFECT.StatusParalysis",
      icon: "icons/svg/paralysis.svg"
    },
    {
      id: "blind",
      name: "EFFECT.StatusBlind",
      icon: "icons/svg/blind.svg"
    },
    {
      id: "fear",
      name: "EFFECT.StatusFear",
      icon: "icons/svg/terror.svg"
    },
    {
      id: "bleeding",
      name: "EFFECT.StatusBleeding",
      icon: "icons/svg/blood.svg"
    },
    {
      id: "disease",
      name: "EFFECT.StatusDisease",
      icon: "icons/svg/biohazard.svg"
    },
    {
      id: "poison",
      name: "EFFECT.StatusPoison",
      icon: "icons/svg/poison.svg"
    },
    {
      id: "invisible",
      name: "EFFECT.StatusInvisible",
      icon: "icons/svg/invisible.svg"
    }
  ];
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '@initiative',
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = KSActor;
  CONFIG.Item.documentClass = KSItem;
  CONFIG.ChatMessage.documentClass = KSChatMessage;

  // Define and push custom dice types
  CONFIG.Dice.KSRoll = KSRoll;
  CONFIG.Dice.rolls.push(KSRoll);
  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('kaiserschlacht', KSActorSheet, {
    makeDefault: true,
    label: 'KAISERSCHLACHT.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('kaiserschlacht', KSItemSheet, {
    makeDefault: true,
    label: 'KAISERSCHLACHT.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

//dice so nice special color for difficulty dice
Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addColorset({
    name: 'diff',
    description: 'Difficulty dice.',
    category: 'Colors',
    foreground: '#ffe436',
    background: '#000000',
    outline: 'black',
    texture: 'none',
    material: 'plastic'
  });

});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);
  console.log(item);
  // Create the macro command using the uuid.
  const command = `game.kaiserschlacht.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: item.system.formula,
      flags: { 'kaiserschlacht.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
