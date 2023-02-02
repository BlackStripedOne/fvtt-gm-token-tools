import { MODULE } from './constants.js'
import { Logger, Utils } from './utils.js'
import { registerSettings } from './settings.js'
import { GmTokenToolsApi } from './api.js'
import { Hud } from './hud.js'

Hooks.on('ready', async () => {
  // TODO
  Hooks.callAll(MODULE.LCCNAME + 'Initialized')
  Logger.info("Ready");
})

Hooks.once("init", () => {
  registerSettings();
  Logger.debug("Init Done");
});

Hooks.on('canvasReady', async () => {
  Hooks.on(MODULE.LCCNAME + 'Initialized', async () => {
    const gmOnly = Utils.getSetting('gmOnly');

    // If no application instance exists, create a new instance of GmTokenToolsApi and initialize it
    if (!game.gmTokenTools) {
      game.gmTokenTools = new GmTokenToolsApi()
      await game.gmTokenTools.init()
      Logger.debug('gmTokenTools API registered as game.gmTokenTools');
    }

    // Registers hooks
    if (game.user.isGM) {
      Hooks.on('renderTokenHUD', (app, html, data) => {
        Hud.gmTokenTools.addTokenInfos(app, html, data);
        Hud.gmTokenTools.addTokenActions(app, html, data);
      });
    } else if (!gmOnly) {
      Hooks.on('renderTokenHUD', (app, html, data) => {
        Hud.gmTokenTools.addTokenInfos(app, html, data);
      });
    }

    Hooks.on('updateToken', (token, data, diff) => {
      // If it's an X or Y change, assume the token is just moving
      if (Object.hasOwn(diff, 'y') || Object.hasOwn('diff', 'x')) return
      // TODO
      Logger.debug(updateToken);
    });
  })
})