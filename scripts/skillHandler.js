import { Logger, Utils } from './utils.js'
import { MODULE } from './constants.js'

/**
 * Skill and attribute specific handlers
 */
export class SkillHandler {

  /**
     * Requests a roll from a user via the chat, deciding to send it to all or only the player the roll is requested from.
     * 
     * @param {Token} token - the selected token to request the roll from 
     * @param {String} type - may be one of 'skill', 'attribute' 
     * @param {String} id - the name of the skill or attribute to request the roll for 
     * @param {Number} difficulty - the optional difficulty for the roll 
     * @param {Boolean} toAll - true, in case the message shall be sent to everyone, to the token owning player otherwise 
     */
  static async requestRoll(token, type, id, difficulty, toAll) {
    const dif = difficulty < 0 ? ` ${difficulty}` : (difficulty > 0 ? ` +${difficulty}` : "")
    const itemHtml = await renderTemplate('modules/' + MODULE.ID + '/templates/requestRollChat.hbs', {
      'type': type,
      'difficulty': difficulty,
      'id': id,
      'dif': dif
    })
    const chatHtml = game.i18n.format("actions.requestRoll", {
      user: game.user.name,
      item: itemHtml
    })

    let chatMessage = {
      user: game.user._id,
      content: chatHtml
    }

    if (game.gmTokenTools._gtt.chatToTarget == 'alwaysUser'
      || (game.gmTokenTools._gtt.chatToTarget == 'shiftEveryoneElseUser' && !toAll)
      || (game.gmTokenTools._gtt.chatToTarget == 'shiftUserElseEveryone' && toAll)) {
      let userId = Utils.getUserByTokenId(token)
      if (userId === undefined) return
      mergeObject(chatMessage, { whisper: [userId] })
    }

    ChatMessage.create(chatMessage)
  } // requestRoll

  /**
  * Opens a dialog for setting up a request to roll from a user via the chat, deciding to send it to all or only the player the roll is requested from.
  * 
  * @param {Token} token - the selected token to request the roll from 
  * @param {String} type - may be one of 'skill', 'attribute' 
  * @param {String} id - the name of the skill or attribute to request the roll for 
  * @param {Boolean} toAll - true, in case the message shall be sent to everyone, to the token owning player otherwise  
  */
  static async requestRollDialog(token, type, id, toAll) {
    const dialogHtml = game.i18n.format("actions.requestRollDialog.content", {
      skill: id
    })

    const template = await renderTemplate('modules/' + MODULE.ID + '/templates/requestRollDialog.hbs', {
      text: dialogHtml
    })

    // TODO Localization
    new game.dsa5.apps.DSA5Dialog({
      title: Utils.i18n("actions.requestRollDialog.title"),
      content: template,
      buttons: {
        ok: {
          label: Utils.i18n('yes'),
          callback: dlg => {
            const difficulty = dlg.find('input[name="entryselection"]').val()
            SkillHandler.requestRoll(token, type, id, difficulty, toAll);
          }
        },
        cancel: {
          label: Utils.i18n('abort')
        }
      }
    }).render(true)
  } // requestRollDialog

  /**
   * Handling skill and attribute rolls
   *
   * @param {Token} token - the selected token to request the roll from
   * @param {String} type - may be one of 'skill', 'attribute'
   * @param {*} value
   * @param {*} modifier
   */
  static async handleRoll(token, type, value, modifier) {
    let id
    let skillAttrObj
    if (type == "attribute") {
      id = game.dsa5.apps.DSA5_Utility.attributeLocalization(value) // TODO test if exists
      skillAttrObj = value;
    } else if (type == "skill") {
      // TODO check if such a skill exists
      skillAttrObj = await game.dsa5.apps.DSA5_Utility.skillByName(value);
      id = value;
    }

    let action = 'nothing'
    if (Utils.isBitSet(modifier, 0)) {
      // ctrl action
      action = game.gmTokenTools._gtt.ctrlAction
    } else if (Utils.isBitSet(modifier, 1)) {
      // alt action
      action = game.gmTokenTools._gtt.altAction
    } else {
      // normal action
      action = game.gmTokenTools._gtt.defaultAction
    }

    switch (action) {
      case "requestRoll":
        Logger.debug('Requesting roll', { 'token': token, 'type': type, 'id': id, 'skillAttrObj': skillAttrObj })
        SkillHandler.requestRoll(token, type, id, 0, Utils.isBitSet(modifier, 2))
        break;
      case "requestRollDialog":
        Logger.debug('Requesting roll Dialog', { 'token': token, 'type': type, 'id': id, 'skillAttrObj': skillAttrObj })
        SkillHandler.requestRollDialog(token, type, id, Utils.isBitSet(modifier, 2))
        break;
      case "initiateRoll":
        Logger.debug('Initiae Roll', { 'token': token, 'type': type, 'id': id, 'skillAttrObj': skillAttrObj })

        if (type == 'skill') {
          token.actor.setupSkill(skillAttrObj, {}, token._id).then(setupData => {
            token.actor.basicTest(setupData)
          })
        } else if (type == 'attribute') {
          token.actor.setupCharacteristic(skillAttrObj, {}, token._id).then(setupData => {
            token.actor.basicTest(setupData)
          })
        }
        break
    }
  } // handleRoll

}
