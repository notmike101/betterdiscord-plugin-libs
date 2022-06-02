import { findModuleByProps } from 'betterdiscord/bdapi';

export const selectedGuildStore = findModuleByProps('getLastSelectedGuildId');
export const guildStore = findModuleByProps('getGuilds');
export const app = findModuleByProps('app', 'layers');

export const DiscordModules = Object.freeze({
  selectedGuildStore,
  guildStore,
  app,
});
