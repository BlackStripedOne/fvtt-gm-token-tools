import { MODULE } from './constants.js'
import { Logger, Utils } from './utils.js'
import { registerSettings } from './settings.js'

Hooks.on('ready', async () => {
    // TODO
    Hooks.callAll(MODULE.LCCNAME + 'Initialized')
    Logger.info("Ready");
})

Hooks.once("init", () => {
    registerSettings();
    Utils.debug("Init Done");
});

Hooks.on('canvasReady', async () => {
    Hooks.on(MODULE.LCCNAME + 'Initialized', async () => {
        const gmOnly = Utils.getSetting('gmOnly');

        // Registers hooks
        if (gmOnly && game.user.isGM) {
            Hooks.on('renderTokenHUD', (app, html, data) => {
                GmTokenTools.addTokenInfos(app, html, data);
                GmTokenTools.addTokenActions(app, html, data);
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
