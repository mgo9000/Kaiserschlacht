/**
 * Popout menu handling stat increases etc.
 *
 * @param {KSActor} actor        
 * @param {object} [options={}]
 * @param {string} [options.statType=null]
 * @param {string} [options.statKey=null]  
 * @param {string} [options.stat=null]  
 */
export class StatManager extends FormApplication {
    constructor(actor, options = {}) {
        super(options);

        this.actor = actor;
        this.statType = options.statType;
        this.statKey = options.statKey;
        this.stat = options.stat;

    }
    /** @inheritdoc */
    getData() {
        return {
            cssClass: "editable",
            statType: this.statType,
            stat: this.stat,
            statKey: this.statKey,
            actor: this.actor,
            title: "Stat Configuration"
        };
    }


    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/kaiserschlacht/templates/helpers/stat-manager.hbs",
            width: 400,
            height: 300
        });
    }
    /* -------------------------------------------- */

    /** @inheritdoc */
    async _updateObject(event, formData) {
        console.log(formData);
        //return this.object.update(formData);
    }
}