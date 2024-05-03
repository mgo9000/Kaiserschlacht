export function registerSettings() {
  game.settings.register("kaiserschlacht", "autoExpireEffexts", {
    name: "Auto Expire Effects",
    hint: "Automatically remove status effects when their duration has expired.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
}
