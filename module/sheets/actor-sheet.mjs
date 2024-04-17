import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";
import { diffDialog } from "../helpers/dice-dialog.mjs";
import { KSRoll } from "../helpers/roll.mjs";
import { blockDialog } from "../helpers/block-dialog.mjs";
import { StatManager } from "../helpers/stat-manager.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class KSActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["kaiserschlacht", "sheet", "actor"],
      width: 770,
      height: 560,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "actions",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/kaiserschlacht/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores, skills, and class stats.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      if (typeof v != "object") {
        console.log("error rendering actor ability");
      } else
        v.label = game.i18n.localize(CONFIG.KAISERSCHLACHT.abilities[k]) ?? k;
    }
    for (let [k, v] of Object.entries(context.system.skills)) {
      if (typeof v != "object") {
        console.log("error rendering actor skill");
      } else v.label = game.i18n.localize(CONFIG.KAISERSCHLACHT.skills[k]) ?? k;
    }
    for (let [k, v] of Object.entries(context.system.classStats)) {
      if (typeof v != "object") {
        console.log("error rendering actor classStat");
      } else
        v.label = game.i18n.localize(CONFIG.KAISERSCHLACHT.classStats[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const weapons = [];
    const armor = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === "spell") {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      } else if (i.type === "weapon") {
        {
          weapons.push(i);
        }
      } else if (i.type === "armor") {
        {
          armor.push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.weapons = weapons;
    context.armor = armor;
  }
  /**
   * Since tagify leaves an empty field as "" not [], this must be remedied.
   * @override
   */
  async _onSubmit(
    event,
    { updateData, preventClose = false, preventRender = false } = {}
  ) {
    event.preventDefault();
    if (this.actor.type === "npc") {
      for (const input of this.form.querySelectorAll("tags ~ input")) {
        if (input.value === "") input.value = "[]";
      }
    }
    return super._onSubmit(event, { updateData, preventClose, preventRender });
  }
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // toggle item equip
    html.on("click", ".equip-toggle", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));

      item.equipToggle();
    });

    // Add Inventory Item
    html.on("click", ".item-create", this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities
    html.on("click", ".rollable", this._onRoll.bind(this));
    // Dodge/block buttons
    html.on("click", ".dodge-button", this._onDodge.bind(this));
    html.on("click", ".cover-button", this._onCover.bind(this));
    html.on("click", ".block-button", this._onBlock.bind(this));

    // Stat management
    html.on("click", ".stat-display", this._onStatManage.bind(this));
    // Damage application from the button.
    html.on(
      "click",
      ".apply-damage-button",
      this._onClickApplyDamage.bind(this)
    );
    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
    if (this.actor.type === "npc") {
      const damageTagInput = html[0].querySelector(
        'input[name="system.damageTags"]'
      );
      const damageTagify = new Tagify(damageTagInput, {
        whitelist: CONFIG.weaponTagWhitelist,
        enforceWhitelist: true,
      });
      if (damageTagInput) {
        damageTagify.DOM.scope.dataset.name = damageTagInput.name;
      }
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label ? `${dataset.label}` : "";

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType == "attack") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.attackRoll();
      } else if (dataset.rollType == "reload") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType == "diff") {
        const amendedFormula = await diffDialog(dataset.roll);
        let roll = new KSRoll(amendedFormula, this.actor.getRollData(), {});
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
          rollMode: game.settings.get("core", "rollMode"),
        });
        return roll;
      }
    } else if (dataset.roll) {
      let roll = new KSRoll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }

  async _onDodge(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const dodgeValue =
      this.actor.system.abilities.finesse.value +
      this.actor.system.abilities.finesse.bonus;
    console.log(dodgeValue);
    ActiveEffect.create(
      {
        name: "Dodge",
        icon: "icons/svg/wing.svg",
        duration: { duration: 1, turns: 1 },
        changes: [{ key: "system.tempArmor", value: dodgeValue * 2 }],
        flags: {
          onRemove: "toggleTokenStatus",
          onRemoveArgs: { id: "prone" },
        },
      },
      { parent: this.actor }
    );
  }

  async _onCover(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorTokens = this.actor.getActiveTokens(true, true);
    actorTokens.forEach((token) =>
      token.toggleActiveEffect(
        CONFIG.statusEffects.find((e) => e.id === "cover")
      )
    );
  }

  async _onBlock(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const blockValue = await blockDialog();
    ActiveEffect.create(
      {
        name: "Block",
        icon: "icons/svg/shield.svg",
        duration: { duration: 1, rounds: 1 },
        changes: [{ key: "system.tempArmor", value: blockValue }],
        flags: { startOfNext: true },
      },
      { parent: this.actor }
    );
  }
  _onClickApplyDamage(event) {
    event.preventDefault();
    const a = event.currentTarget;
    let dataset = a.dataset;
    const targetTokens = canvas.tokens.controlled;
    for (let token of targetTokens) {
      token.actor._applyDamage(dataset.damage, JSON.parse(dataset.damageTags));
    }
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onStatManage(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const elementStatType = dataset.statType;
    const elementStat = JSON.parse(dataset.stat);
    const elementStatKey = dataset.statKey;
    new StatManager(this.actor, {
      statType: elementStatType,
      stat: elementStat,
      statKey: elementStatKey,
    }).render(true);
  }
}
