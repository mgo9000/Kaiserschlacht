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
    if (actorData.type !== "character") return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using dice pool rules.
      let dicepool = ["1d4", "1d4", "1d6", "1d8", "1d8+1d4", "1d8+1d6", "2d8"];
      if (ability.value + ability.bonus > 6) {
        ability.mod = dicepool[6];
      } else if (ability.value < 0) {
        ability.mod = dicepool[0];
      } else {
        ability.mod = dicepool[ability.value + ability.bonus] ?? "Error";
      }
    }
    for (let [key, skill] of Object.entries(systemData.skills)) {
      let dicepool = ["1d4", "1d4", "1d6", "1d8", "1d8+1d4", "1d8+1d6", "2d8"];
      if (skill.value + skill.bonus > 6) {
        skill.mod = dicepool[6];
      } else if (skill.value + skill.bonus < 0) {
        skill.mod = dicepool[0];
      } else {
        skill.mod = dicepool[skill.value + skill.bonus] ?? "Error";
      }
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== "npc") return;

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
    if (this.type !== "character") return;

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
    if (this.type !== "npc") return;

    // Process additional NPC data here.
  }

  //Default token params overwritten

  /** @override */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;

    // Configure prototype token initial settings
    const prototypeToken = {};
    if (this.type === "character")
      Object.assign(prototypeToken, {
        sight: { enabled: true },
        actorLink: true,
        disposition: 1,
      });
    this.updateSource({ prototypeToken });
  }

  // Apply damage
  async _applyDamage(damage, damageTags) {
    console.log(damageTags);
    const damageTemplate =
      "systems/kaiserschlacht/templates/chat/damage-card.hbs";
    const damageValue = damage;
    const currentHealth = this.system.health.value;
    const armorPiercing = damageTags?.some(
      (damageTags) => damageTags.value.toLowerCase() === "AP".toLowerCase()
    );
    const piercing = damageTags?.some(
      (damageTags) =>
        damageTags.value.toLowerCase() === "Piercing".toLowerCase()
    );
    const currentArmor = this.system.armor;
    const currentTempArmor = this.system.tempArmor;

    const effectCollection = this.getEmbeddedCollection("effects");
    const tempArmorEffect = effectCollection?.find((effect) =>
      effect.changes.some(
        (change) => change.key === "system.tempArmor" && change.value > 0
      )
    );

    const tempArmorOriginalChanges = tempArmorEffect?.changes;
    //storing the changes array as a string so that it can be retained without being mutated; also means it does not need to be stringified on the card itself
    const tempArmorOriginalChangesString = JSON.stringify(
      tempArmorOriginalChanges
    );
    const tempArmorEffectIndex = tempArmorEffect?.changes.findIndex(
      (change) => change.key === "system.tempArmor" && change.value > 0
    );
    const totalArmor = currentArmor + currentTempArmor;
    let adjustedArmor;
    let APBeaten = false;
    if (armorPiercing && damageValue >= totalArmor) {
      APBeaten = true;
      if (currentTempArmor <= 0) {
        adjustedArmor = Math.clamped(currentArmor - 1, 0, 9999);
        this.update({ system: { armor: adjustedArmor } });
      } else {
        let tempArmorNewChanges = tempArmorOriginalChanges;
        tempArmorNewChanges[tempArmorEffectIndex].value = Math.clamped(
          tempArmorNewChanges[tempArmorEffectIndex].value - 1,
          0,
          9999
        );
        tempArmorEffect.update({ changes: tempArmorNewChanges });
      }
    } else {
      APBeaten = false;
    }
    let adjustedDamage =
      piercing === true
        ? Math.clamped(damageValue, 0, 9999)
        : Math.clamped(damageValue - totalArmor, 0, 9999);
    let adjustedHealth = Math.clamped(currentHealth - adjustedDamage, 0, 9999);
    this.update({ system: { health: { value: adjustedHealth } } });
    const templateData = {
      recipient: this.name,
      originalDamage: damageValue,
      totalDamage: adjustedDamage,
      originalHealth: currentHealth,
      armor: currentArmor,
      tempArmor: currentTempArmor,
      totalArmor: currentArmor + currentTempArmor,
      tempArmorEffect: tempArmorEffect,
      tempArmorOriginalChanges: tempArmorOriginalChangesString,
      tempArmorEffectIndex: tempArmorEffectIndex,
      ap: armorPiercing,
      pierced: piercing,
      beaten: APBeaten,
      user: game.user.id,
      uuid: this.uuid,
    };
    const html = await renderTemplate(damageTemplate, templateData);

    const chatData = {
      user: game.user.id,
      content: html,
      // speaker: ChatMessage.getSpeaker({ actor: this })
    };

    ChatMessage.create(chatData);
  }

  /**
   * Remove any expired effects when prompted
   */
  removeExpiredEffects() {
    let effectCollection = this.effects;
    let effectClone = foundry.utils.deepClone(effectCollection);
    let expiredEffectIDs = [];
    effectClone.forEach((effect) => {
      if (
        effect.duration.remaining <= 0 &&
        effect.duration.remaining !== null
      ) {
        expiredEffectIDs.push(effect._id);
      }
    });
    this.deleteEmbeddedDocuments("ActiveEffect", expiredEffectIDs);
  }
}
