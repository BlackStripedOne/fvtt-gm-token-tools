import { Logger, Utils } from './utils.js'

/**
 * The module application
 */
export class GmTokenTools extends Application {

    /**
     * Initialise the application
     */
    async init() {
        this.isDebug = Utils.getSetting('debug')
        // TODO

        Logger.debug('Application Initialized');
    }

    /**
     * Update Token Action HUD following change to module settings
     */
    updateSettings() {
        Logger.debug('Updating Settings...')
        this.isDebug = Utils.getSetting('debug')
        // TODO
        Logger.debug('Settings Updated')
    }

    static async addTokenActions(app, html, data) {
        let actor = canvas.tokens.get(data._id).actor;
        if (actor === undefined) return;

        let checks = [];

        for (let item of actor.items) {
            switch (item.type) {
                case "adventage":
                case "disadventage": {
                    Logger.debug("item Adv/DisAdv", item);
                } break
                case "specialability": {
                    Logger.debug("item SpecAbili", item);
                } break
                case "combatskill": {
                    Logger.debug("item combSkill", item);
                } break
                case "skill": {
                    Logger.debug("skill", item);
                    if (item.system.talentValue.value > 0) {
                        checks.push({
                            name: item.name,
                            value: item.system.talentValue.value
                        });
                    }
                } break
            }
        }

        let defaultActions = '';

        // Collect talents  
        let checksHtml = '';
        checks.sort((a, b) => b.value - a.value);
        for (let item of checks) {
            checksHtml += '<li onClick="game.dsa5.macro.requestRoll(\'' + item.name + '\', 0);">' + item.name + ' (' + item.value + ')</li>';
        }
        defaultActions = '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
            Utils.i18n('actions.talents.name') +
            '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list">' +
            checksHtml +
            '</ul></div>';

        // Collect characteristics  
        let attribsHtml = '';
        attribsHtml = '<li onClick="game.dsa5.macro.requestRoll(\'Mut\', 0);">(' + actor.system.characteristics.mu.value + ') ' +
            Utils.i18n('actions.characteristics.mu.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Klugheit\', 0);">(' + actor.system.characteristics.kl.value + ') ' +
            Utils.i18n('actions.characteristics.kl.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Intuition\', 0);">(' + actor.system.characteristics.in.value + ') ' +
            Utils.i18n('actions.characteristics.in.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Charisma\', 0);">(' + actor.system.characteristics.ch.value + ') ' +
            Utils.i18n('actions.characteristics.ch.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Fingerfertigkeit\', 0);">(' + actor.system.characteristics.ff.value + ') ' +
            Utils.i18n('actions.characteristics.ff.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Gewandheit\', 0);">(' + actor.system.characteristics.ge.value + ') ' +
            Utils.i18n('actions.characteristics.ge.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Konstitution\', 0);">(' + actor.system.characteristics.ko.value + ') ' +
            Utils.i18n('actions.characteristics.ko.name') +
            '</li>';
        attribsHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Körperkraft\', 0);">(' + actor.system.characteristics.kk.value + ') ' +
            Utils.i18n('actions.characteristics.kk.name') +
            '</li>';

        defaultActions += '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
            Utils.i18n('actions.characteristics.name') +
            '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list">' +
            attribsHtml +
            '</ul></div>';

        // Special actions/macros  
        let specialHtml = '';
        specialHtml += '<li onClick="game.macros.get(\'i7f0cLStubnwqy8q\')._executeScript({actor:canvas.tokens.get(\'' + data._id + '\').actor, token:canvas.tokens.get(\'' + data._id + '\').actor}); return false;">' +
            '1d6 Schaden' +
            '</li>';
        specialHtml += '<li onClick="game.dsa5.macro.requestRoll(\'Regeneration\', 0);">' +
            'Regenerieren' +
            '</li>';

        defaultActions += '<div class="control-icon token-tool-icon" title="Roll Checks"><i class="fas fa-dice"></i> ' +
            'Specials' +
            '</div><div class="token-tool-list-wrapper"><ul class="token-tool-list">' +
            specialHtml +
            '</ul></div>';

        let htmlWrap = $(`<div class="col token-tool-column-right">${defaultActions}</div>`);
        html.find('.col.right').wrap('<div class="token-tool-container">');
        html.find('.col.right').before(htmlWrap);
    } // addTokenActions

    static async addTokenInfos(app, html, data) {
        let actor = canvas.tokens.get(data._id).actor;
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
            '"><i class="fas fa-shield-alt"></i> ' +
            expTotal +
            '</div>';

        let htmlWrap = $(`<div class="col token-tool-column-left">${defaultInfos}</div>`);
        html.find('.col.left').wrap('<div class="token-tool-container">');
        html.find('.col.left').before(htmlWrap);
    } // addTokenInfos

}  // GmTokenTools