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

    let defaultInfos = '';

    // Collect speed
    let speed = actor.system.status.speed.max;
    defaultInfos += '<div class="control-icon token-tool-icon" title="' +
      Utils.i18n('infos.speed.name') +
      ': ' +
      speed +
      '"><i class="fas fa-walking"></i> ' +
      speed +
      '</div>';

    // Collect total experience
    let expTotal = '-';
    if (actor.type == 'creature') {
      expTotal = 'crt';
    } else if (actor.type == 'npc') {
      expTotal = 'npc';
    } else if (actor.type == 'character') {
      expTotal = actor.system.details.experience.total;
    } else {
      expTotal = '-';
    }
    defaultInfos += '<div class="control-icon token-tool-icon" title="' +
      Utils.i18n('infos.expTotal.name') +
      ': ' +
      expTotal +
      '"><i class="fas fa-solid fa-scroll"></i> ' +
      expTotal +
      '</div>';

    let acTotal = 0
    defaultInfos += '<div class="control-icon token-tool-icon" title="' +
      Utils.i18n('infos.acTotal.name') +
      ': ' +
      acTotal +
      '"><i class="fas fa-shield-alt"></i> ' +
      acTotal +
      '</div>';


    let htmlWrap = $(`<div class="col token-tool-column-left">${defaultInfos}</div>`);
    html.find('.col.left').wrap('<div class="token-tool-container">');
    html.find('.col.left').before(htmlWrap);
    Logger.debug('Infos injected into token HUD');
  } // addTokenInfos

}