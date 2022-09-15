export default class ErrorHandler extends Error {

    constructor(error, extraInfo) {
        super();
        let errorCodeMap = {
            "ERR:01": ["[ERR:01] If you want to use more than one saved card selector is mandatory to set the relativeToCreditCard at options. The relativeToCreditCard option default value is 1", "https:/tuna.dev.br/plugins/javascript/errors#err01"],
            "ERR:02": ["[ERR:02] The piece cannot be created. The piece place '{placeReference}' does not exist", "https:/tuna.dev.br/plugins/javascript/errors#err02"],
            "ERR:03": ["[ERR:03] The piece type is invalid: {pieceType}", "https:/tuna.dev.br/plugins/javascript/errors#err03"],
            "ERR:04": ["[ERR:04] The propertyName parameter is mandatory when creating a formated field piece", "https:/tuna.dev.br/plugins/javascript/errors#err04"],
            "ERR:05": ["[ERR:05] Missing 'pattern' property.", "https:/tuna.dev.br/plugins/javascript/errors#err05"],
            "ERR:06": ["[ERR:06] The 'validationFunction' property is not a function.", "https:/tuna.dev.br/plugins/javascript/errors#err06"],
            "ERR:07": ["[ERR:07] There are invalid data on following fields: '{fieldNames}'", "https:/tuna.dev.br/plugins/javascript/errors#err07"],
            "ERR:08": ["[ERR:08] The card token cannot be generated. The following field(s) has not been found: {notFilledFields}", "https:/tuna.dev.br/plugins/javascript/errors#err08"],
            "ERR:09": ["[ERR:09] The response callback function was not provided", "https:/tuna.dev.br/plugins/javascript/errors#err09"],
            "ERR:10": ["[ERR:10] The documentFormatter parameter needs to be instance of BuyerDocumentFormatter", "https:/tuna.dev.br/plugins/javascript/errors#err10"],
            "ERR:11": ["[ERR:11] The document piece cannot be created. The buyerDocumentFormatter property wasn't setted", "https:/tuna.dev.br/plugins/javascript/errors#err11"],
            "ERR:12": ["[ERR:12] The {pieceType} piece cannot be created. The options property wasn't setted", "https:/tuna.dev.br/plugins/javascript/errors#err12"],
            "ERR:13": ["[ERR:13] The {pieceType} piece cannot be created. The options property isn't in the rigth format", "https:/tuna.dev.br/plugins/javascript/errors#err13"],
            "ERR:14": ["[ERR:14] A recent checkout call is already executing", "https:/tuna.dev.br/plugins/javascript/errors#err14"],
            "ERR:15": ["[ERR:15] You should use a number at relativeToCreditCard property", "https:/tuna.dev.br/plugins/javascript/errors#err15"],
            "ERR:16": ["[ERR:16] You cannot proceed with the payment with credit card if your checkoutData parameter do not provide only successfully tokenized cards", "https:/tuna.dev.br/plugins/javascript/errors#err16"],
            "ERR:17": ["[ERR:17] Error while binding the saved token", "https:/tuna.dev.br/plugins/javascript/errors#err17"],
            "ERR:18": ["[ERR:18] The Google Pay container selector '{selector}' not return an element", "https:/tuna.dev.br/plugins/javascript/errors#err18"],
            "ERR:19": ["[ERR:19] The Google Pay settings object do not contain the mandatory properties", "https:/tuna.dev.br/plugins/javascript/errors#err19"],
            "ERR:20": ["[ERR:20] You already used {cardID} as relativeToCreditCard when forge another saved card selector component. The default value to relativeToCreditCard is 1", "https:/tuna.dev.br/plugins/javascript/errors#err20"],
            "ERR:21": ["[ERR:21] The instructions property needs to be an string array", "https:/tuna.dev.br/plugins/javascript/errors#err21"],
            "ERR:24": ["[ERR:24] The paymentCallback property is mandatory and needs to be a function", "https:/tuna.dev.br/plugins/javascript/errors#err24"],
            "ERR:25": ["[ERR:25] You need to provide checkoutCallback or checkoutAndPayConfig property to create a default payment form", "https:/tuna.dev.br/plugins/javascript/errors#err25"],
            "ERR:26": ["[ERR:26] The checkoutAndPayConfig property must be an object", "https:/tuna.dev.br/plugins/javascript/errors#err26"],
            "ERR:27": ["[ERR:27] The checkoutAndPayConfig.totalPaymentAmount property must be a positive number greater than 0", "https:/tuna.dev.br/plugins/javascript/errors#err27"],
            "ERR:28": ["[ERR:28] The checkoutAndPayConfig.paymentMethodAmount property must be a positive number greater than 0", "https:/tuna.dev.br/plugins/javascript/errors#err28"],
            "ERR:29": ["[ERR:29] The checkoutAndPayConfig.callbackFunction property must be a function", "https:/tuna.dev.br/plugins/javascript/errors#err29"],
            "ERR:31": ["[ERR:31] You must fill pixInfo or cryptoInfo on options parameters at useQrCodePayment method ", "https:/tuna.dev.br/plugins/javascript/errors#err31"],
            "ERR:32": ["[ERR:32] The <{propName}> property needs to be a not empty string. Review the options sent to useQrCodePayment function", "https:/tuna.dev.br/plugins/javascript/errors#err32"],
            "ERR:33": ["[ERR:33] You cannot provide filled pixInfo and cryptoInfo at same time.", "https:/tuna.dev.br/plugins/javascript/errors#err33"],
            "ERR:34": ["[ERR:34] You need to send a sessionID to start Tuna", "https:/tuna.dev.br/plugins/javascript/errors#err34"],
            "ERR:36": ["[ERR:36] Invalid paymentMethodType. Use 'pix', 'creditCard', 'crypto' or 'bankInvoice'", "https:/tuna.dev.br/plugins/javascript/errors#err36"],
            "ERR:37": ["[ERR:37] Error calling pay method. The checkoutData parameter cannot be null when paymentMethodType equals 'creditCard'", "https:/tuna.dev.br/plugins/javascript/errors#err37"],
            "ERR:38": ["[ERR:38] You should set a title to a custom area", "https:/tuna.dev.br/plugins/javascript/errors#err38"],
            "ERR:39": ["[ERR:39] You should set a least one field to a custom", "https:/tuna.dev.br/plugins/javascript/errors#err39"],
            "ERR:40": ["[ERR:40] Error while loading anti fraud scripts", "https:/tuna.dev.br/plugins/javascript/errors#err40"],
            "ERR:41": ["[ERR:41] Error while loading 3DS data collection script", "https:/tuna.dev.br/plugins/javascript/errors#err41"],
            "ERR:42": ["[ERR:42] Error while mounting paymentMethod property. Is the checkoutData parameter correct?", "https:/tuna.dev.br/plugins/javascript/errors#err42"],
            "ERR:22": ["[ERR:22] ADD NEW ERROR HERE", "https:/tuna.dev.br/plugins/javascript/errors#err22"],
            "ERR:23": ["[ERR:23] ADD NEW ERROR HERE", "https:/tuna.dev.br/plugins/javascript/errors#err23"],
            "ERR:30": ["[ERR:30] ADD NEW ERROR HERE", "https:/tuna.dev.br/plugins/javascript/errors#err30"],
            "ERR:35": ["[ERR:35] ADD NEW ERROR HERE", "https:/tuna.dev.br/plugins/javascript/errors#err35"],
        };
        if (error && typeof error === 'string') {
            let mapedError = errorCodeMap[error];
            this.code = error;
            if (mapedError) {
                this.message = mapedError[0];
                if (extraInfo)
                    this.message = this.message.formatUnicorn(extraInfo);
                this.stack = (new Error(this.message + "\n" + mapedError[1])).stack;
            } else {
                this.message = error;
                this.stack = error.stack;
            }
        } else if (error && error instanceof Error) {
            this.code = "Unknown";
            this.message = error.message;
            this.stack = error.stack;
        } else {
            this.code = "Unknown";
            this.message = error;
            this.stack = (new Error()).stack;
        }
        this.name = this.constructor.name;
    }
}

String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
    function () {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments)
                : arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
            }
        }

        return str;
    };