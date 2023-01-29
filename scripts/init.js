import { MODULE } from './constants.js'
import { Logger, Utils } from './utils.js'
import { registerSettings } from './settings.js'
import { GmTokenTools } from './gm-token-tools.js'

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

        // If no application instance exists, create a new instance of GmTokenTools and initialise it
        if (!game.gmTokenTools) {
            game.gmTokenTools = new GmTokenTools()
            await game.gmTokenTools.init()
        }

        // Registers hooks
        if (gmOnly && game.user.isGM) {
            Hooks.on('renderTokenHUD', (app, html, data) => {
                // TODO: Potentially use instance on game.gmTokenTools instead of static
                game.gmTokenTools.addTokenInfos(app, html, data);
                game.gmTokenTools.addTokenActions(app, html, data);
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
