import { Logger, Utils } from './utils.js'

/**
 * The module application, forward features for keeping state on object rather then statics
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
  

}  // GmTokenTools