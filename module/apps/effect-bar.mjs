/**
 * Application responsible for tracking combatants in initiative.
 *
 * @export
 * @class EffectBar
 * @typedef {EffectBar}
 * @extends {Application}
 *
 */
export default class EffectBar extends Application {
  /** @override */
  getData() {
    // Retrieve base data structure.
    let context = super.getData();

    const controlledToken = canvas.tokens.controlled[0];
    console.log(controlledToken);
    console.log(canvas.tokens);

    context.statuses = controlledToken?.actor.getEmbeddedCollection("effects");
    console.log(context.statuses);

    return context;
  }
  /** @override */
  render(force, options) {
    let app = super.render(force, options);
    console.log(this);
    app.options.renderData = this.getData();
    return app;
  }
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/kaiserschlacht/templates/apps/effect-bar.hbs",
      id: "effect-bar",
      popOut: false,
    });
  }
}
