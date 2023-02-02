import { Logger, Utils } from './utils.js'
import GTT from './config.js'
import { MODULE } from './constants.js'

/**
 * The module application
 */
export class GmTokenTools extends Application {

  /**
   * Initialize the application
   */
  async init() {
    this.updateSettings()
    Logger.debug('Application Initialized')
  }

  /**
   * Update Token Action HUD following change to module settings
   */
  updateSettings() {
    Logger.debug('Updating Settings...')
    this.isDebug = Utils.getSetting('debug')
    this.chatToTarget = Utils.getSetting('chatToTarget')
    this.defaultAction = Utils.getSetting('defaultAction')
    this.ctrlAction = Utils.getSetting('ctrlAction')
    this.altAction = Utils.getSetting('altAction')
    Logger.debug('Settings Updated')
  }

  /**
   * Rolls a 1d6 damage roll for the token's actor
   * @param {String} the token id to roll the damage for
   */
  async rollDamageForToken(tokenId) {
    let token = Utils.getToken(tokenId)
    if (token === undefined) return

    let roll = await new Roll('1d6[black]').evaluate({ async: true })
    game.dice3d?.showForRoll(roll);
    token.actor.applyDamage(roll.total)

    //Compile the template
    let compiledTemplate = Handlebars.compile(Utils.i18n('actions.damageRoll.chatHb'))

    //Render the data into the template
    let chatHtml = compiledTemplate({ name: token.actor.name, roll: roll.total })

    ChatMessage.create({
      user: game.user._id,
      content: chatHtml
    })
  }   // rollDamageForToken


  /**
   * Requests a roll from a user via the chat, deciding to send it to all or only the player the roll is requested from.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {String} type - may be one of 'skill', 'attribute' 
   * @param {String} id - the name of the skill or attribute to request the roll for 
   * @param {Number} difficulty - the optional difficulty for the roll 
   * @param {Boolean} toAll - true, in case the message shall be sent to everyone, to the token owning player otherwise 
   */
  requestRoll(token, type, id, difficulty, toAll) {
    const dif = difficulty < 0 ? ` ${difficulty}` : (difficulty > 0 ? ` +${difficulty}` : "")
    const chatHtml = game.i18n.format("gmTokenTools.actions.requestRoll", {
      user: game.user.name,
      item: `<a class="roll-button request-roll" data-type="${type}" data-modifier="${difficulty}" data-name="${id}"><i class="fas fa-dice"></i> ${id}${dif}</a>`
    })

    let chatMessage = {
      user: game.user._id,
      content: chatHtml
    }

    if (this.chatToTarget == 'alwaysUser'
      || (this.chatToTarget == 'shiftEveryoneElseUser' && !toAll)
      || (this.chatToTarget == 'shiftUserElseEveryone' && toAll)) {
      let userId = Utils.getUserByTokenId(token)
      if (userId === undefined) return
      mergeObject(chatMessage, { whisper: [userId] })
    }

    ChatMessage.create(chatMessage)
  }

  /**
   * Opens a dialog for setting up a request to roll from a user via the chat, deciding to send it to all or only the player the roll is requested from.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {String} type - may be one of 'skill', 'attribute' 
   * @param {String} id - the name of the skill or attribute to request the roll for 
   * @param {Boolean} toAll - true, in case the message shall be sent to everyone, to the token owning player otherwise  
   */
  async requestRollDialog(token, type, id, toAll) {
    const dialogHtml = game.i18n.format("gmTokenTools.actions.requestRollDialog.content", {
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
          label: "Ja",
          callback: dlg => {
            const difficulty = dlg.find('input[name="entryselection"]').val()
            this.requestRoll(token, type, id, difficulty, toAll);
          }
        },
        cancel: {
          label: "Abbrechen"
        }
      }
    }).render(true)
  }

  /**
   * TODO called from API... required still?
   *
   * @param {Token} token - the selected token to request the roll from
   * @param {String} type - may be one of 'skill', 'attribute'
   * @param {*} value
   * @param {*} modifier
   */
  async handleRoll(token, type, value, modifier) {
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
      action = this.ctrlAction
    } else if (Utils.isBitSet(modifier, 1)) {
      // alt action
      action = this.altAction
    } else {
      // normal action
      action = this.defaultAction
    }

    switch (action) {
      case "requestRoll":
        Logger.debug('Requesting roll', { 'token': token, 'type': type, 'id': id, 'skillAttrObj': skillAttrObj })
        this.requestRoll(token, type, id, 0, Utils.isBitSet(modifier, 2))
        break;
      case "requestRollDialog":
        Logger.debug('Requesting roll Dialog', { 'token': token, 'type': type, 'id': id, 'skillAttrObj': skillAttrObj })
        this.requestRollDialog(token, type, id, Utils.isBitSet(modifier, 2))
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
  }

  /**
   * Does a specific damage roll and shows the result to chat.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {*} damage - the damage object as per GTT.damageTypes
   * @param {*} options - data strucure, holding the infos from the dialog. options[option].val and options[option].mod
   */
  async doDamageRoll(token, damage, options) {
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
    token.actor.applyDamage(roll.total)

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
      'roll': roll.total,
      'dice': dice,
      'damageType': damage.name,
      'modifier': damageModifier,
      'modifiers': modifiers
    })

    ChatMessage.create({
      user: game.user._id,
      content: chatHtml
    })
  }

  /**
   * Collect applicable options from the dialog form
   * @param {jQuery} jq - the jQuery instance of the dialog to process
   * @param {*} dmg - the damage object as per GTT.damageTypes
   * @returns 
   */
  _collectOptions(jq, dmg) {
    let result = {}
    let val
    let elem
    for (let option in dmg.options) {
      let optionObject = dmg.options[option]
      result[option] = {}
      switch (optionObject.type) {
        case 'number':
          val = jq.find('input#' + option + '[type=number]')?.val()
          val = Math.min(Math.max(optionObject.range.min, val), optionObject.range.max)
          result[option].val = val
          break
        case 'chooseOne':
          elem = jq.find('select#' + option + ' option:selected')
          // TODO check if exists
          result[option].val = elem.val()
          // optionally set modifier text
          if (elem.attr('data-modtext')) {
            result[option].mod = Utils.i18n(elem.attr('data-modtext'))
          }
          break
        case 'boolean':
          elem = jq.find('input#' + option + '[type=checkbox]')
          if (elem.is(':checked')) {
            result[option].val = optionObject.values.true.value
            // optionally set modifier text
            if (elem.attr('data-modtext')) {
              result[option].mod = Utils.i18n(elem.attr('data-modtext'))
            }
          } else {
            result[option].val = optionObject.values.false.value
          }
          break
      }
      // optionally format the resulting roll formula
      if (optionObject['format'] !== undefined) {
        const template = Handlebars.compile(optionObject.format);
        result[option].val = template({ 'value': result[option].val })
      }
    }
    // Add optional manual modifier
    if (jq.find('input#manual[type=number]')) {
      val = jq.find('input#manual[type=number]').val()
      if (val != 0) {
        result['manual'] = {
          'val': val,
          // TODO add '+' when positive
          'mod': Utils.i18n('damage.manualModifier.labelMod') + ': ' + val
        }
      }
    }
    Logger.debug('Collected options from dialog', result)
    return result
  }

  /**
   * Handles the damageroll by showing a dialog with the options for that damage type.
   * 
   * @param {Token} token - the selected token to request the roll from 
   * @param {String} value - name of the damage roll type as found in GTT.damageTypes
   * @param {Number} modifier - keyboard modifier bit: 0:Crtl, 1:Alt, 2:Shift
   */
  async handleDamageRoll(token, value, modifier) {
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
            if (choice == optionObject.default) {
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
            this.doDamageRoll(token, damage, this._collectOptions(dlg, damage));
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
  }

  /**
   * Internal function to add all token actions to the token hud.
   * 
   * @param {Application} app - the application of the calling action
   * @param {Html} html - the html dom object
   * @param {GameData} data - the foundry game data instance
   */
  async addTokenActions(app, html, data) {
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
  async addTokenInfos(app, html, data) {
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

}  // GmTokenTools