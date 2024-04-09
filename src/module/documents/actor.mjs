/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class KSActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.

  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.kaiserschlacht || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;


    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using dice pool rules.
      let dicepool = ["1d4", "1d4", "1d6", "1d8", "1d8+1d4", "1d8+1d6", "2d8"];
      if (ability.value + ability.bonus > 6) {
        ability.mod = dicepool[6];
      }
      else if (ability.value < 0) {
        ability.mod = dicepool[0];
      }
      else {
        ability.mod = dicepool[ability.value + ability.bonus] ?? "Error";
      }

    }
    for (let [key, skill] of Object.entries(systemData.skills)) {
      let dicepool = ["1d4", "1d4", "1d6", "1d8", "1d8+1d4", "1d8+1d6", "2d8"];
      if (skill.value + skill.bonus > 6) {
        skill.mod = dicepool[6];
      }
      else if (skill.value + skill.bonus < 0) {
        skill.mod = dicepool[0];
      }
      else {
        skill.mod = dicepool[skill.value + skill.bonus] ?? "Error";
      }
    }

  }


  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    systemData.xp = systemData.cr * systemData.cr * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with `this.system`
    const data = { ...super.getRollData() };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@physique.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    if (data.skills) {
      for (let [k, v] of Object.entries(data.skills)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    if (data.classStats) {
      for (let [k, v] of Object.entries(data.classStats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    // Add skillPoints for easier access, or fall back to 0.
    if (data.attributes.skillPoints) {
      data.skillPoints = data.attributes.skillPoints.value ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  //Default token params overwritten 

  /** @override */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;

    // Configure prototype token initial settings
    const prototypeToken = {};
    // Object.assign(prototypeToken, {bar2:{attribute: null}});
    if (this.type === "character") Object.assign(prototypeToken, {
      sight: { enabled: true }, actorLink: true, disposition: 1
    });
    this.updateSource({ prototypeToken });
  }

  // Apply damage
  async _applyDamage(damage, damageTags = null) {
    const damageTemplate = "systems/kaiserschlacht/templates/chat/damage-card.hbs";
    const damageValue = damage;
    const currentHealth = this.system.health.value;
    const armorPiercing = damageTags.includes("ap") || damageTags.includes("AP");
    const piercing = damageTags.includes("piercing") || damageTags.includes("Piercing");
    const currentArmor = this.system.armor;
    let adjustedArmor;
    let APBeaten = false;
    if ((armorPiercing && damageValue >= currentArmor)) {
      APBeaten = true;
      adjustedArmor = Math.clamped(currentArmor - 1, 0, 9999);
      this.update({ system: { armor: adjustedArmor } });
    }
    else {
      APBeaten = false;
    }
    let adjustedDamage = piercing === true ? Math.clamped(damageValue, 0, 9999) : Math.clamped(damageValue - currentArmor, 0, 9999);
    let adjustedHealth = Math.clamped(currentHealth - adjustedDamage, 0, 9999);
    this.update({ system: { health: { value: adjustedHealth } } });
    const templateData = {
      recipient: this.name,
      originalDamage: damageValue,
      totalDamage: adjustedDamage,
      originalHealth: currentHealth,
      armor: currentArmor,
      ap: armorPiercing || piercing,
      beaten: APBeaten,
      user: game.user.id,
      uuid: this.uuid
    };
    const html = await renderTemplate(damageTemplate, templateData);

    const chatData = {
      user: game.user.id,
      content: html,
      // speaker: ChatMessage.getSpeaker({ actor: this })
    };

    ChatMessage.create(chatData);
  }

}  