import { Logger, Utils } from './utils.js'
import { GmTokenTools } from './gm-token-tools.js'

/**
 * Gamemaster Token Tools public API functions, attached to the foundry game object.
 */
export class GmTokenToolsApi {

    // public references
    isDebug = false
    gmTokenTools = undefined

    /**
     * Initialize the application
     */
    async init() {
        this.isDebug = Utils.getSetting('debug')
        // Attach the api instance if not already done
        if (this.gmTokenTools === undefined) {
            this.gmTokenTools = new GmTokenTools();
            this.gmTokenTools.init();
        }
        Logger.info('API Initialized');
    }

    /**
     * Update Token Action HUD following change to module settings
     */
    updateSettings() {
        this.gmTokenTools?.updateSettings()
    }

    /**
     * Handles clicks on elements
     * 
     * @param {jQuery} html - the jQuery instance of the element that was clicked 
     * @returns 
     */
    handleClick(html) {
        let clickId = html.getAttribute('data-id')
        let clickType = html.parentElement.getAttribute('data-type')
        let clickToken = html.parentElement.getAttribute('data-token')
        let token = Utils.getToken(clickToken);
        if (token === undefined) return;

        let modifier = 0
        if (window.event.ctrlKey) modifier += 1
        if (window.event.altKey) modifier += 2
        if (window.event.shiftKey) modifier += 4

        if (clickType == 'attribute' || clickType == 'skill') {
            this.gmTokenTools?.handleRoll(token, clickType, clickId, modifier);
        } else if (clickType == 'damage') {
            this.gmTokenTools?.handleDamageRoll(token, clickId, modifier);
        } else {
            Logger.debug("handleClick(): unknown how to handle parameters", { 'clickId': clickId, 'clickType': clickType, 'clickToken': clickToken, 'modifier': modifier })
        }
    }

}   // GmTokenToolsApi