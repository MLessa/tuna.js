import ErrorHandler from "./support/errorHandler.js";
import * as cardValidator from "card-validator";
import Configs from "./support/config.js";

export default class Tokenizer {

    constructor(sessionID, env) {
        this.tokenAPIURL = Configs[env].TOKEN_API_URL;
        this.sessionID = sessionID;
    }

    async bind(token, cvv) {
        try {
            const options = {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({ "SessionId": this.sessionID, token, cvv, authenticationInformation: { code: this.sessionID } })
            }
            return await (await fetch(`${this.tokenAPIURL}/Bind`, options)).json();

        } catch (error) {
            throw new ErrorHandler(error);
        }
    }

    async delete(token) {
        try {
            const options = {
                method: 'delete',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({ "SessionId": this.sessionID, token })
            }

            return await (await fetch(`${this.tokenAPIURL}/Delete`, options)).json();

        } catch (error) {
            throw new ErrorHandler(error);
        }
    }

    async list() {
        try {
            const options = {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({ "SessionId": this.sessionID })
            }

            return await (await fetch(`${this.tokenAPIURL}/List`, options)).json();

        } catch (error) {
            throw new ErrorHandler(error);
        }
    }

    async generate(cardData) {
        const cardPayload = filterCardPayload(cardData);

        const options = {
            method: 'post',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({ "SessionId": this.sessionID, card: cardPayload, authenticationInformation: { code: this.sessionID } })
        }

        return await (await fetch(`${this.tokenAPIURL}/Generate`, options)).json();
    }
}

function filterCardPayload(creditCardData) {
    const mandatoryProperties = ["cardHolderName", "cardNumber", "expirationMonth", "expirationYear"];
    let notFilledMandatoryProperties = mandatoryProperties;
    let invalidFields = [];
    let tokenGeneratePayload = {};


    if (creditCardData.data)
        tokenGeneratePayload.data = creditCardData.data;

    for (const prop in creditCardData) {
        if (mandatoryProperties.includes(prop)) {

            notFilledMandatoryProperties = notFilledMandatoryProperties.filter(e => e !== prop);

            if (isFieldValid(creditCardData[prop], prop)) {
                tokenGeneratePayload[prop] = creditCardData[prop];
            }
            else {
                invalidFields.push(prop);
            }
        } else {
            tokenGeneratePayload[prop] = creditCardData[prop];
        }
    }

    if (notFilledMandatoryProperties.length > 0)
        throw new ErrorHandler("ERR:08", { notFilledFields: notFilledMandatoryProperties.join(",") });

    if (invalidFields.length > 0)
        throw new ErrorHandler("ERR:07", { fieldNames: invalidFields.join(",") });
    return tokenGeneratePayload;
}

function isFieldValid(data, propertyName) {
    if (data == null || (typeof data === "string" && !data.trim()))
        return false;

    if (propertyName === "cardNumber") {
        if (!cardValidator.number(data).isPotentiallyValid && data[0] != '0')
            return false;
    } else if (propertyName === "expirationMonth") {
        if (data <= 0 || data > 12)
            return false;
    } else if (propertyName === "expirationYear") {
        let thisYear = new Date().getFullYear();
        if (data < thisYear || data > thisYear + 13)
            return false;
    } else if (propertyName === "singleUse") {
        if (typeof data !== "boolean")
            return false;
    }
    return true;
}