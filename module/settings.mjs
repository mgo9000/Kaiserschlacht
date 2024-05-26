export function registerSettings() {
  game.settings.register("kaiserschlacht", "autoExpireEffexts", {
    name: "Auto Expire Effects",
    hint: "Automatically remove status effects when their duration has expired.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
  game.settings.register("kaiserschlacht", "autoDownAtZero", {
    name: "Auto Expire Effects",
    hint: "Automatically set characters to Fading or Dead when they hit 0 wounds (depending on whether they are a PC or NPC, repspectively).",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
}
