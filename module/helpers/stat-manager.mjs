/**
 * Popout menu handling stat increases etc.
 *
 * @param {KSActor} actor        
 * @param {object} [options={}]
 * @param {string} [options.statType=null]
 * @param {string} [options.stat=null]  
 */
export class StatManager extends FormApplication {
    constructor(actor, options = {}) {
        super(options);

        /**
         * The original actor
         * @type {KSActor}
         */
        this.actor = actor;
        this.statType = options.statType;
        this.stat = options.stat;

    }


    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/kaiserschlacht/templates/helpers/stat-manager.hbs",
            width: 400,
            height: "auto"
        });
    }
}