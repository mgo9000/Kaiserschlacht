/**
 * Popout menu handling stat increases etc.
 *
 * @param {KSActor} actor        
 * @param {object} [options={}]
 * @param {string} [options.statType=null]
 * @param {string} [options.stat=null]  
 */
export class StatManager extends DocumentSheet {
    constructor(actor, options = {}) {
        super(options);

        this.actor = actor;
        this.statType = options.statType;
        this.stat = options.stat;

    }
    /** @inheritdoc */
    getData() {
        const data = this.document.toObject(false);
        return {
            cssClass: "editable",
            editable: true,
            statType: this.statType,
            stat: this.stat,
            document: this.actor,
            data: data,
            options: this.options,
            title: this.title
        };
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