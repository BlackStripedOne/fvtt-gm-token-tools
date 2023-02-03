import { MODULE } from './constants.js'
import { Logger, Utils } from './utils.js'
import GTT from './config.js'

/**
 * Dialogs helpers for the gmTokenTools
 */
export class Hud {

  /**
   * Internal function to add all token actions to the token hud.
   * 
   * @param {Application} app - the application of the calling action
   * @param {Html} html - the html dom object
   * @param {GameData} data - the foundry game data instance
   */
  static async addTokenActions(app, html, data) {
    let actor = canvas.tokens.get(data._id).actor;
    if (actor === undefined) return;

    let actionsData = {
      'tokenId': data._id,
      'defaultAction': 'settings.actionChoices.' + game.gmTokenTools._gtt.defaultAction,
      'ctrlAction': 'settings.actionChoices.' + game.gmTokenTools._gtt.ctrlAction,
      'altAction': 'settings.actionChoices.' + game.gmTokenTools._gtt.altAction,
      'chatToTarget': 'settings.chatToTarget.choices.' + game.gmTokenTools._gtt.chatToTarget,
      'skills': [],
      'attribs': [],
      'health': []
    }

    // collect applicable checks the token's actor has
    let checks = [];
    for (let item of actor.items) {
      switch (item.type) {
        case "skill":
          if (item.system.talentValue.value > 0) {
            checks.push({
              name: item.name,
              value: item.system.talentValue.value
            });
          }
          break
        case "adventage":
        case "disadventage":
        case "specialability":
        case "combatskill":
        default:
          // Logger.debug('item '+item.type, item);
          break
      }
    }

    // collect and sort skills
    checks.sort((a, b) => b.value - a.value);
    for (let item of checks) {
      actionsData.skills.push({
        'id': item.name,
        'name': item.name,
        'value': item.value
      })
    }

    // collect and sort attributes  
    let attributes = ['mu', 'kl', 'in', 'ch', 'ff', 'ge', 'ko', 'kk']
    // TODO sorting?
    for (let attrib of attributes) {
      actionsData.attribs.push({
        'id': attrib,
        'name': game.dsa5.apps.DSA5_Utility.attributeLocalization(attrib),
        'value': actor.system.characteristics[attrib].value
      })
    }

    // cifepoints related actions
    for (let damageType in GTT.damageTypes) {
      actionsData.health.push({
        'id': damageType,
        'name': GTT.damageTypes[damageType].name
      })
    }

    const htmlContent = await renderTemplate('modules/' + MODULE.ID + '/templates/hudActions.hbs', actionsData)
    let jqHtmlContent = $(htmlContent);
    html.find('.col.right').wrap('<div class="token-tool-container">');
    html.find('.col.right').before(jqHtmlContent);
    Logger.debug('Actions injected to token HUD');
  } // addTokenActions

  /**
   * Internal function to add all token informations to the token hud.
   * @param {Application} the application of the calling action
   * @param {Html} the html dom object
   * @param {GameData} the foundry game data instance
   */
  static async addTokenInfos(app, html, data) {
    let actor = Utils.getActor(null, data._id); // canvas.tokens.get(data._id).actor;
    if (actor === undefined) return;

    let infosData = {
      'speed': actor.system.status.speed.max
    }

    // collect total experience
    infosData.exp = {
      'type': actor.type,
      'creature': actor.creatureType
    }
    switch (actor.type) {
      case 'character':
        infosData.exp.current = actor.system.details.experience.current
        infosData.exp.spent = actor.system.details.experience.spent
        infosData.exp.total = actor.system.details.experience.total
      case 'npc':
      case 'creature':
        // nothing to add yet
    }

    infosData.armor = {
      'total': 0,
      'head': 0,
      'leftarm': 0,
      'leftleg': 0,
      'rightarm': 0,
      'rightleg': 0
    }
    // collect worn armor
    for(let armor in actor.itemTypes.armor) {
      if (armor.type == 'armor') {
        infosData.armor.head += armor.protection.head
        infosData.armor.total += armor.protection.head
        infosData.armor.leftarm += armor.protection.leftarm
        infosData.armor.total += armor.protection.leftarm
        infosData.armor.leftleg += armor.protection.leftleg
        infosData.armor.total += armor.protection.leftleg
        infosData.armor.rightarm += armor.protection.rightarm
        infosData.armor.total += armor.protection.rightarm
        infosData.armor.rightleg += armor.protection.rightleg
        infosData.armor.total += armor.protection.rightleg
      }
    }

    const htmlContent = await renderTemplate('modules/' + MODULE.ID + '/templates/hudInfos.hbs', infosData)
    let jqHtmlContent = $(htmlContent);
    html.find('.col.left').wrap('<div class="token-tool-container">');
    html.find('.col.left').before(jqHtmlContent);
    Logger.debug('Infos injected into token HUD');
  } // addTokenInfos

}