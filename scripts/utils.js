import { MODULE } from './constants.js'

/**
 * Console logger
 */
export class Logger {
    static info(message, notify = false) {
        console.log(MODULE.NAME + ` Info | ${message}`)
        if (notify) ui.notifications.info(MODULE.NAME + ` | ${message}`)
    }

    static error(message, notify = false) {
        console.error(MODULE.NAME + ` Error | ${message}`)
        if (notify) ui.notifications.error(MODULE.NAME + ` | ${message}`)
    }

    static debug(message, data) {
        const isDebug = (game.gmTokenTools) ? game.gmTokenTools.isDebug : Utils.getSetting('debug', false)
        if (isDebug) {
            if (!data) {
                console.log(MODULE.NAME + ` Debug | ${message}`)
                return
            }
            const dataClone = Utils.deepClone(data)
            console.log(MODULE.NAME + ` Debug | ${message}`, dataClone)
        }
    }
}

export class Utils {
    /**
     * Foundry VTT's deepClone function wrapped here to avoid code error highlighting due to missing definition.
     * @param {*} original
     * @param {*} options
     */
    static deepClone(original, options) {
        // eslint-disable-next-line no-undef
        return deepClone(original, options)
    }

    /**
     * Get actor from the token or actor object
     * @param {string} actorId The actor id
     * @param {string} tokenId The token id
     * @returns {object}       The actor
     */
    static getActor(actorId, tokenId) {
        let token = null
        if (tokenId) token = canvas.tokens.placeables.find((token) => token.id === tokenId)
        if (token) return token.actor
        return game.actors.get(actorId)
    }

    /**
     * Get item from the actor object
     * @param {object} actor  The actor
     * @param {string} itemId The item id
     * @returns {object}      The item
     */
    static getItem(actor, itemId) {
        return actor.items.get(itemId)
    }

    /**
     * Get token
     * @param {string} tokenId The token id
     * @returns {object}       The token
     */
    static getToken(tokenId) {
        return canvas.tokens.placeables.find((token) => token.id === tokenId)
    }

    /**
     * Get controlled tokens
     * @returns {array} The controlled tokens
     */
    static getControlledTokens() {
        return game.canvas.tokens.controlled
    }

    /**
     * Get one controlled tokens
     * @returns {object} The first controlled token
     */
    static getControlledToken() {
        return game.canvas.tokens.controlled[0]
    }

    /**
     * Get setting value
     * @param {string} key               The setting key
     * @param {string=null} defaultValue The setting default value
     * @returns {*}                      The setting value
     */
    static getSetting(key, defaultValue = null) {
        let value = defaultValue ?? null
        try {
            value = game.settings.get(MODULE.ID, key)
        } catch {
            console.log(MODULE.NAME + ` Debug | GameConfig '${key}' not found`)
        }
        return value
    }

    /**
     * Set setting value
     * @param {string} key   The setting key
     * @param {string} value The setting value
     */
    static async setSetting(key, value) {
        if (game.settings.settings.get(`${MODULE.ID}.${key}`)) {
            await game.settings.set(MODULE.ID, key, value)
            Logger.debug(`GameConfig '${key}' set to '${value}'`)
        } else {
            Logger.debug(`GameConfig '${key}' not found`)
        }
    }

    /**
     * Get module user flag
     * @param {string} key The flag key
     * @returns {*}        The flag value
     */
    static getUserFlag(key) {
        return game.user.getFlag(MODULE.ID, key)
    }

    /**
     * Set module user flag
     * @param {string} key The flag key
     * @param {*} value    The flag value
     */
    static async setUserFlag(key, value) {
        await game.user.setFlag(MODULE.ID, key, value)
    }

    /**
     * Unset module user flag
     * @param {string} key The flag key
     */
    static async unsetUserFlag(key) {
        await game.user.unsetFlag(MODULE.ID, key)
    }

    /**
     * Language translation
     * @param {string} toTranslate The value to translate
     * @returns {string} The translated value
     */
    static i18n(toTranslate) {
        return game.i18n.localize(MODULE.LCCNAME + '.' + toTranslate)
    }

    /**
     * Whether the given module is active
     * @param {string} id The module id
     * @returns {boolean}
     */
    static isModuleActive(id) {
        const module = game.modules.get(id)
        return module && module.active
    }
}
