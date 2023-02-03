import { Logger, Utils } from './utils.js'
import GTT from './config.js'
import { MODULE } from './constants.js'

/**
 * Damage specific handlers
 */
export class DamageHandler {

  /**
   * Does a specific damage roll and shows the result to chat.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {*} damage - the damage object as per GTT.damageTypes
   * @param {*} options - data strucure, holding the infos from the dialog. options[option].val and options[option].mod
   */
  static async doDamageRoll(token, damage, options) {
    Logger.debug('doDamageRoll', { 'token': token, 'damage': damage, 'options': options })

    // Collect all roll options
    let rollOptions = {}
    for (let option in options) {
      rollOptions[option] = options[option].val
    }
    let roll = new Roll(damage.formula, rollOptions);
    await roll.evaluate({ async: true })
    game.dice3d?.showForRoll(roll)

    // Apply rolled damage to the token's actor
    let damagePoints = Math.max(0, roll.total)
    token.actor.applyDamage(damagePoints)

    // Collect individual die information
    let dice = []
    let damageModifier = roll.total
    for (let die in roll.dice) {
      for (let i = 0; i < roll.dice[die].number; i++) {
        dice.push({
          'die': 'd' + roll.dice[die].faces,
          'value': roll.dice[die].results[i].result
        })
        damageModifier -= roll.dice[die].results[i].result
      }
    }

    // Collect applicable modifier texts
    let modifiers = []
    for (let optId in options) {
      if (options[optId]['mod'] !== undefined) {
        modifiers.push(options[optId].mod)  // TODO i18n
      }
    }

    // Render the data into the template
    // TODO i18n
    const chatHtml = await renderTemplate('modules/' + MODULE.ID + '/templates/damageRollResultChat.hbs', {
      'name': token.actor.name,
      'roll': damagePoints,
      'dice': dice,
      'damageType': damage.name,
      'modifier': damageModifier,
      'modifiers': modifiers
    })

    ChatMessage.create({
      user: game.user._id,
      content: chatHtml
    })
  } // doDamageRoll

  /**
   * Handles the damageroll by showing a dialog with the options for that damage type.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {String} value - name of the damage roll type as found in GTT.damageTypes
   * @param {Number} modifier - keyboard modifier bit: 0:Crtl, 1:Alt, 2:Shift
   */
  static async handleDamageRoll(token, value, modifier) {
    Logger.debug('handleDamageRoll', { 'token': token, 'value': value, 'mod': modifier });

    if (GTT.damageTypes[value] === undefined) return;
    let damage = GTT.damageTypes[value]

    let dialogData = {
      'damageHeader': Utils.i18n(damage.name) + ' Wurf für ' + token.actor.name,
      'damageDescription': damage.description,
      'options': []
    }

    for (let option in damage.options) {
      let optionObject = damage.options[option]
      switch (optionObject.type) {
        case 'number':
          dialogData.options.push({
            'type': 'number',
            'id': option,
            'label': optionObject.label,
            'min': optionObject.range.min,
            'max': optionObject.range.max,
            'value': optionObject.defValue,
            'unit': optionObject.unit
          });
          // TODO add possibility to add a modText
          break
        case 'chooseOne':
          let choices = []
          for (let choice in optionObject.options) {
            let choiceData = {}
            if (choice == optionObject.defValue) {
              // Select the default value
              choiceData.selected = true;
            }
            if (optionObject.options[choice]['modText'] !== undefined) {
              // Add modifier text for chat message
              choiceData.modText = optionObject.options[choice].modText
            }
            choiceData.value = optionObject.options[choice].value
            choiceData.name = optionObject.options[choice].name
            choices.push(choiceData)
          }

          dialogData.options.push({
            'type': 'chooseOne',
            'id': option,
            'label': optionObject.label,
            'choices': choices
          });

          break
        case 'boolean':
          let dlgOption = {
            'type': 'boolean',
            'id': option,
            'label': optionObject.label
          }
          if (optionObject.values.true['modText'] !== undefined) {
            // Add modifier text for chat message
            dlgOption.modText = optionObject.values.true.modText
          }
          dialogData.options.push(dlgOption)
          break
        default:
          Logger.debug('Invalid configuration', damage);
      }
    }
    // Add optional manual modifier
    if (damage['manualModification'] !== undefined && damage['manualModification']) {
      dialogData.options.push({
        'type': 'number',
        'id': 'manual',
        'label': 'damage.manualModifier.label',
        'value': 0
      })
    }

    Logger.debug('DamageRollDialog', dialogData)
    // Render the data into the template
    // TODO i18n
    const contentHtml = await renderTemplate('modules/' + MODULE.ID + '/templates/damageRollDialog.hbs', dialogData)

    // TODO i18n
    new game.dsa5.apps.DSA5Dialog({
      title: 'Schadensprobe auf ' + Utils.i18n(damage.name) + ' anfordern',
      content: contentHtml,
      buttons: {
        ok: {
          label: "Ja",
          callback: dlg => {
            DamageHandler.doDamageRoll(token, damage, Utils.collectOptions(dlg, damage));
          }
        },
        cancel: {
          label: "Abbrechen"
        }
      }
    }, {
      width: 700,
      resizable: false
    }).render(true)
  } // handleDamageRoll

}
