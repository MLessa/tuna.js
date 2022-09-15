var defaultInputMethods = {
    onBeforeMount() {
        this.state.inputContainerID = `inpcid_${Math.random().toString(18).substring(2)}`;
    },
    focus() {
        this.state.inputComponent.focus();
    },
    setValue(value) {
        this.state.inputComponent.setValue(value);
    },
    clear() {
        this.state.inputComponent.clear();
    },
    showValidationMessage(value) {
        this.state.inputComponent.showValidationMessage(value);
    },
    setDisabled(disabled) {
        this.state.inputComponent.setDisabled(disabled);
    },
    isDisabled() {
        return this.state.inputComponent.isDisabled();
    },
    updatePrefix(type, prefix, prefixClass) {
        this.state.inputComponent.updatePrefix(type, prefix, prefixClass);
    },
    updateSuffix(type, suffix, suffixClass) {
        this.state.inputComponent.updateSuffix(type, suffix, suffixClass);
    }
}

var defaultSelectMethods = {
    onBeforeMount() {
        this.state.inputContainerID = `inpcid_${Math.random().toString(18).substring(2)}`;
    },
    focus() {
        this.state.inputComponent.focus();
    },
    setValue(value) {
        this.state.inputComponent.setValue(value);
    },
    clear() {
        this.state.inputComponent.clear();
    },
    setDisabled(disabled) {
        this.state.inputComponent.setDisabled(disabled);
    },
    isDisabled() {
        return this.state.inputComponent.isDisabled();
    }
}

export { defaultInputMethods, defaultSelectMethods }
