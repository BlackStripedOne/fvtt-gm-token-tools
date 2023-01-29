import { MODULE } from './constants.js'
import { Logger, Utils } from './utils.js'

function onChangeFunction(value) {
    if (game[MODULE.LCCNAME]) game[MODULE.LCCNAME].updateSettings()
}

export const registerSettings = function () {
    game.settings.register(MODULE.ID, 'startup', {
        name: 'One-Time Startup Prompt',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE.ID, 'debug', {
        name: Utils.i18n('settings.debug.name'),
        hint: Utils.i18n('settings.debug.hint'),
        scope: 'client',
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => {
            onChangeFunction(value)
        }
    })

    game.settings.register(MODULE.ID, 'gmOnly', {
        name: Utils.i18n('settings.gmOnly.name'),
        hint: Utils.i18n('settings.gmOnly.hint'),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });

    game.settings.register(MODULE.ID, 'showCombatSkills', {
        name: Utils.i18n('settings.showCombatSkills.name'),
        hint: Utils.i18n('settings.showCombatSkills.hint'),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register(MODULE.ID, 'defaultAction', {
        name: Utils.i18n('settings.defaultAction.name'),
        hint: Utils.i18n('settings.defaultAction.hint'),
        scope: "world",
        config: true,
        type: String,
        default: "requestRoll",
        choices: {
            "requestRoll": Utils.i18n('settings.defaultAction.choices.requestRoll'),
            "initiateRoll": Utils.i18n('settings.defaultAction.choices.initiateRoll')
        }
    });

    Logger.debug("Settings Registered");
}
