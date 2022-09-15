import ErrorHandler from "../support/errorHandler.js";

export default class Piece {

    constructor(place, id, type, opts, component, validationFunction, group, relativeToCreditCard, isEmbedded = false) {
        this.place = place;
        this.id = id;
        this.type = type;
        this.opts = opts;
        this.component = component;
        this.validationFunction = validationFunction;
        this.group = group;
        this.relativeToCreditCard = relativeToCreditCard;
        this.isEmbedded = isEmbedded;
        this.isEnabled = true;
    }

    getId = _ => this.id;
    getPlace = _ => this.place;
    getGroup = _ => this.group;
    clear = _ => this.component.clear();
    unmountComponent = preserveRoot => this.component.unmount(preserveRoot);
    getValidationFunction = _ => this.validationFunction;
    getPropertyName = _ => this.type.propertyName;
    getOptions = _ => this.opts;
    updateComponent = _ => this.component.update();
    getType = _ => this.type;

    changeEnableStatus(enabled) {
        this.isEnabled = enabled;
        if (this.component.setDisabled)
            this.component.setDisabled(!this.isEnabled);
    }

    getValue() {
        let value;
        try {
            this.resetInvalidMarkup();
            value = this.component.getValue();

            if (value === null && !this.isEnabled)
                return null;

            if (value && typeof value === "string" && this.opts.cleanMask)
                value = value.replace(/[^\da-zA-Z]/g, '');

            if (this.validationFunction) {
                if (this.validationFunction(value))
                    return value;
                else {
                    this.markAsInvalid();
                    throw new ErrorHandler("ERR:07", { fieldNames: this.type.name });
                }
            }
            return value;
        } catch (e) {
            this.markAsInvalid();
            throw e;
        }
    }

    setValue(value) {
        this.component.setValue(value);
        this.component.update();
    }

    markAsInvalid() {
        if (this.component.showValidationMessage) {
            this.component.showValidationMessage(true);
            this.component.focus();
        }
    }

    resetInvalidMarkup() {
        if (this.component.showValidationMessage)
            this.component.showValidationMessage(false);
    }
}
