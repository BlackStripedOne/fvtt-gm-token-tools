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

  game.settings.register(MODULE.ID, 'gmOnly', {
    name: Utils.i18n('settings.gmOnly.name'),
    hint: Utils.i18n('settings.gmOnly.hint'),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: (value) => {
      onChangeFunction(value)
    }
  });

  game.settings.register(MODULE.ID, 'showCombatSkills', {
    name: Utils.i18n('settings.showCombatSkills.name'),
    hint: Utils.i18n('settings.showCombatSkills.hint'),
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: (value) => {
      onChangeFunction(value)
    }
  });

  game.settings.register(MODULE.ID, 'chatToTarget', {
    name: Utils.i18n('settings.chatToTarget.name'),
    hint: Utils.i18n('settings.chatToTarget.hint'),
    scope: "world",
    config: true,
    type: String,
    default: "alwaysEveryone",
    choices: {
      "alwaysEveryone": Utils.i18n('settings.chatToTarget.choices.alwaysEveryone'),
      "alwaysUser": Utils.i18n('settings.chatToTarget.choices.alwaysUser'),
      "shiftEveryoneElseUser": Utils.i18n('settings.chatToTarget.choices.shiftEveryoneElseUser'),
      "shiftUserElseEveryone": Utils.i18n('settings.chatToTarget.choices.shiftUserElseEveryone')
    },
    onChange: (value) => {
      onChangeFunction(value)
    }
  });


  game.settings.register(MODULE.ID, 'defaultAction', {
    name: Utils.i18n('settings.defaultAction.name'),
    hint: Utils.i18n('settings.defaultAction.hint'),
    scope: "world",
    config: true,
    type: String,
    default: "requestRoll",
    choices: {
      "nothing": Utils.i18n('settings.actionChoices.nothing'),
      "requestRoll": Utils.i18n('settings.actionChoices.requestRoll'),
      "requestRollDialog": Utils.i18n('settings.actionChoices.requestRollDialog'),
      "initiateRoll": Utils.i18n('settings.actionChoices.initiateRoll')
    },
    onChange: (value) => {
      onChangeFunction(value)
    }
  });

  game.settings.register(MODULE.ID, 'ctrlAction', {
    name: Utils.i18n('settings.ctrlAction.name'),
    hint: Utils.i18n('settings.ctrlAction.hint'),
    scope: "world",
    config: true,
    type: String,
    default: "nothing",
    choices: {
      "nothing": Utils.i18n('settings.actionChoices.nothing'),
      "requestRoll": Utils.i18n('settings.actionChoices.requestRoll'),
      "requestRollDialog": Utils.i18n('settings.actionChoices.requestRollDialog'),
      "initiateRoll": Utils.i18n('settings.actionChoices.initiateRoll')
    },
    onChange: (value) => {
      onChangeFunction(value)
    }
  });

  game.settings.register(MODULE.ID, 'altAction', {
    name: Utils.i18n('settings.altAction.name'),
    hint: Utils.i18n('settings.altAction.hint'),
    scope: "world",
    config: true,
    type: String,
    default: "nothing",
    choices: {
      "nothing": Utils.i18n('settings.actionChoices.nothing'),
      "requestRoll": Utils.i18n('settings.actionChoices.requestRoll'),
      "requestRollDialog": Utils.i18n('settings.actionChoices.requestRollDialog'),
      "initiateRoll": Utils.i18n('settings.actionChoices.initiateRoll')
    },
    onChange: (value) => {
      onChangeFunction(value)
    }
  });

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

  Logger.debug("Settings Registered");
}