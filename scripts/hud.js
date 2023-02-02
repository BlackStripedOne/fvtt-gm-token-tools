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

    // collect applicable checks the token's actor has
    let checks = [];
    for (let item of actor.items) {
      switch (item.type) {
        case "adventage":
        case "disadventage":
          // Logger.debug("item Adv/DisAdv", item);
          break
        case "specialability":
          // Logger.debug("item SpecAbili", item);
          break
        case "combatskill":
          // Logger.debug("item combSkill", item);
          break
        case "skill":
          if (item.system.talentValue.value > 0) {
            checks.push({
              name: item.name,
              value: item.system.talentValue.value
            });
          }
          break
      }
    }

    let defaultActions = '';

    // Collect talents  
    let checksHtml = '';
    checks.sort((a, b) => b.value - a.value);
    for (let item of checks) {
      checksHtml += '<li onClick="game.gmTokenTools.handleClick(this);" data-id="' + item.name + '">(' + item.value + ') ' + item.name + '</li>';
    }
    defaultActions += '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
      Utils.i18n('actions.skills.name') +
      '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list" data-type="skill" data-token="' + data._id + '">' +
      checksHtml +
      '</ul></div>';

    // Collect characteristics  
    let attribsHtml = ''
    let attributes = ['mu', 'kl', 'in', 'ch', 'ff', 'ge', 'ko', 'kk']
    for (let attrib of attributes) {
      attribsHtml += '<li onClick="game.gmTokenTools.handleClick(this);" data-id="' + attrib + '">(' + actor.system.characteristics[attrib].value + ') ' +
        game.dsa5.apps.DSA5_Utility.attributeLocalization(attrib) +
        '</li>';
    }

    defaultActions += '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
      Utils.i18n('actions.attributes.name') +
      '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list" data-type="attribute" data-token="' + data._id + '">' +
      attribsHtml +
      '</ul></div>';

    // Special actions/macros  
    let specialHtml = '';
    specialHtml += '<li onClick="game.gmTokenTools.rollDamageForToken(\'' + data._id + '\'); return false;">' +
      '1d6 Schaden' +
      '</li>';

    for (let damageType in GTT.damageTypes) {
      specialHtml += '<li onClick="game.gmTokenTools.handleClick(this);" data-id="' + damageType + '">' +
        Utils.i18n(GTT.damageTypes[damageType].name) +
        '</li>';
    }

    specialHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Regeneration\', 0);">' +
      'Regenerieren' +
      '</li>';

    defaultActions += '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
      'Specials' +
      '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list" data-type="damage" data-token="' + data._id + '">' +
      specialHtml +
      '</ul></div>';


    // Add control hints
    defaultActions += '<div class="control-icon token-tool-icon token-tool-hint">'
    if (this.defaultAction != 'nothing') {
      defaultActions += '<i class="fas fa-solid fa-computer-mouse"></i> ' + Utils.i18n('settings.actionChoices.' + this.defaultAction) + '</br>'
    }
    if (this.ctrlAction != 'nothing') {
      defaultActions += '<i class="fas fa-solid fa-computer-mouse"></i>+<span class="key">Ctrl</span> ' + Utils.i18n('settings.actionChoices.' + this.ctrlAction) + '</br>'
    }
    if (this.altAction != 'nothing') {
      defaultActions += '<i class="fas fa-solid fa-computer-mouse"></i>+<span class="key">Alt</span> ' + Utils.i18n('settings.actionChoices.' + this.altAction) + '</br>'
    }
    switch (this.chatToTarget) {
      case 'alwaysEveryone':
      case 'alwaysUser':
        defaultActions += '<i class="fas fa-solid fa-comment"></i> ' + Utils.i18n('settings.chatToTarget.choices.' + this.chatToTarget) + '</br>'
        break
      case 'shiftEveryoneElseUser':
        defaultActions += '<i class="fas fa-solid fa-comment"></i> ' + Utils.i18n('settings.chatToTarget.choices.alwaysUser') + ', <span class="key">Shift</span> ' + Utils.i18n('settings.chatToTarget.choices.shiftEveryoneElseUser') + '</br>'
        break
      case 'shiftUserElseEveryone':
        defaultActions += '<i class="fas fa-solid fa-comment"></i> ' + Utils.i18n('settings.chatToTarget.choices.alwaysUser') + ', <span class="key">Shift</span> ' + Utils.i18n('settings.chatToTarget.choices.shiftEveryoneElseUser') + '</br>'
        break
    }
    defaultActions += '</div>'

    let htmlWrap = $(`<div class="col token-tool-column-right">${defaultActions}</div>`);
    html.find('.col.right').wrap('<div class="token-tool-container">');
    html.find('.col.right').before(htmlWrap);
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