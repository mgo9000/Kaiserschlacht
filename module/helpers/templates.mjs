/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/kaiserschlacht/templates/actor/parts/actor-features.hbs',
    'systems/kaiserschlacht/templates/actor/parts/actor-items.hbs',
    'systems/kaiserschlacht/templates/actor/parts/actor-spells.hbs',
    'systems/kaiserschlacht/templates/actor/parts/actor-effects.hbs',
    'systems/kaiserschlacht/templates/actor/parts/actor-weapons.hbs',
    // Item partials
    'systems/kaiserschlacht/templates/item/parts/item-effects.hbs',
  ]);
};
