import * as riot from 'riot';
import ErrorHandler from "../support/errorHandler.js";
import button from './components/button.riot'
import textField from './components/textField.riot'
import selectField from './components/selectField.riot'
import email from './components/email.riot'
import formattedTextField from './components/formattedTextField.riot'
import creditCard from './components/creditCard.riot'
import creditCardCVV from './components/creditCardCVV.riot'
import validitySelect from './components/validitySelect.riot'
import checkboxField from './components/checkbox.riot'
import validityField from './components/validity.riot'
import defaultPaymentForm from './components/defaultPaymentForm.riot'
import savedCardList from './components/savedCardSelector.riot'
import savedCardListSkeleton from './components/savedCardSelectorSkeleton.riot'
import installmentSelect from './components/installmentSelect.riot'
import holderDocument from './components/document.riot'
import qrCodePaymentBox from './components/qrCodePaymentBox.riot'
import ThreeDSModal from './components/threeDSModal.riot'
import ThreeDSDataCollectionFrame from './components/threeDSDataCollectionFrame.riot'
import Piece from "./piece.js"
import { BuyerDocumentFormatter } from "../support/buyerDocumentFormatter.js";

class PieceManager {

    constructor() {
        this.forgedPieces = new Map();
        this.DEFAULT_PAYMENT_FORM = { component: defaultPaymentForm, type: "defaultForm" };

        this.BUTTON = {
            component: button,
            type: "button"
        };

        this.FORMATTED_FIELD = {
            component: formattedTextField,
            type: "formattedInput"
        };

        this.INPUT_FIELD = {
            component: textField,
            type: "input"
        };

        this.SELECT_FIELD = {
            component: selectField,
            type: "select"
        };

        this.QRCODE_PAYMENT_BOX = {
            component: qrCodePaymentBox,
            type: "qrCodePaymentBox"
        };

        this.CARD_HOLDER_NAME = {
            name: "card holder name",
            component: textField,
            propertyName: 'cardHolderName',
            type: "cardHolderName",
            autocomplete: "cc-name"
        };

        this.EMAIL = {
            name: "email",
            component: email,
            propertyName: 'email',
            type: "email",
            autocomplete: "email"
        };

        this.DOCUMENT = {
            name: "document",
            component: holderDocument,
            propertyName: 'document',
            type: "document"
        };

        this.CREDIT_CARD = {
            name: "credit card number",
            component: creditCard,
            propertyName: 'cardNumber',
            type: "cardNumber",
            autocomplete: "cc-number"
        };

        this.CREDIT_CARD_CVV = {
            name: "credit card cvv",
            component: creditCardCVV,
            propertyName: 'cvv',
            type: "cardCvv",
            autocomplete: "cc-csc"
        };

        this.MONTH_FIELD = {
            name: "month",
            component: validitySelect,
            propertyName: 'expirationMonth',
            type: "month",
            autocomplete: "cc-exp-month"
        };

        this.YEAR_FIELD = {
            name: "year",
            component: validitySelect,
            propertyName: 'expirationYear',
            type: "year",
            autocomplete: "cc-exp-year"
        };

        this.SINGLE_USE_FIELD = {
            name: "single use",
            component: checkboxField,
            propertyName: 'singleUse',
            type: "saveCard"
        };

        this.VALIDITY = {
            name: "validity",
            component: validityField,
            propertyName: 'expiration',
            type: "cardValidity",
            autocomplete: "cc-exp"
        };

        this.SAVED_CARD_SKELETON = {
            component: savedCardListSkeleton,
            type: "savedCardSkeleton"
        };

        this.SAVED_CARD_LIST = {
            name: "saved card list",
            component: savedCardList,
            type: "savedCardSelector",
            propertyName: 'savedCard',
        };

        this.INSTALLMENT_SELECTOR = {
            name: "installment",
            component: installmentSelect,
            propertyName: 'installment',
            type: "installment"
        };

        this.THREEDS_MODAL = {
            component: ThreeDSModal,
            type: "threeDSModal"
        };

        this.THREEDS_DATACOLLECTION_FRAME = {
            component: ThreeDSDataCollectionFrame,
            type: "threeDSDataCollectionFrame"
        };

        Object.freeze(this.BUTTON);
        Object.freeze(this.CARD_HOLDER_NAME);
        Object.freeze(this.CREDIT_CARD);
        Object.freeze(this.CREDIT_CARD_CVV);
        Object.freeze(this.MONTH_FIELD);
        Object.freeze(this.YEAR_FIELD);
        Object.freeze(this.SINGLE_USE_FIELD);
        Object.freeze(this.VALIDITY);
        Object.freeze(this.SAVED_CARD_LIST);
        Object.freeze(this.INSTALLMENT_SELECTOR);
        Object.freeze(this.DOCUMENT);
        Object.freeze(this.QRCODE_PAYMENT_BOX);
        Object.freeze(this.THREEDS_MODAL);
        Object.freeze(this.THREEDS_DATACOLLECTION_FRAME);
        this.pieceTypes = [
            this.BUTTON,
            this.CARD_HOLDER_NAME,
            this.CREDIT_CARD,
            this.CREDIT_CARD_CVV,
            this.MONTH_FIELD,
            this.YEAR_FIELD,
            this.SINGLE_USE_FIELD,
            this.VALIDITY,
            this.SAVED_CARD_LIST,
            this.INPUT_FIELD,
            this.FORMATTED_FIELD,
            this.SAVED_CARD_SKELETON,
            this.DEFAULT_PAYMENT_FORM,
            this.INSTALLMENT_SELECTOR,
            this.DOCUMENT,
            this.QRCODE_PAYMENT_BOX,
            this.THREEDS_MODAL,
            this.THREEDS_DATACOLLECTION_FRAME,
            this.EMAIL
        ];
    }

    changeGroupEnableStatus(group, enabled) {
        this.executeOnPieces(piece => {
            if (piece.getGroup() === group)
                piece.changeEnableStatus(enabled);
        });
    }

    destroyGroup(group, preserveRoot = true) {
        let unmountedPieces = [];

        this.executeOnPieces(piece => {
            if (piece.getGroup() === group) {
                piece.unmountComponent(preserveRoot);
                unmountedPieces.push(piece.id);
            }
        });
        this.forgedPieces.forEach(pieceArray => {
            unmountedPieces.forEach(unmountedPieceID => {
                let pieceToRemove = pieceArray.find(p => p.getId() === unmountedPieceID);
                if (pieceToRemove)
                    pieceArray.splice(pieceArray.indexOf(pieceToRemove), 1);
            });
        });
    }

    close3dsModal() {
        this.executeOnPieces(piece => {
            if (piece.type === this.THREEDS_MODAL)
                piece.unmountComponent();
            if (piece.type === this.THREEDS_DATACOLLECTION_FRAME)
                piece.unmountComponent();
        });
    }

    forge(place, pieceName, props, group = "default", propertyName, validationFunction) {
        console.warn("DEPRECATED. Use createPiece method");
        return this.createPiece(place, pieceName, props, group, propertyName, validationFunction);
    }
    
    createPiece(place, pieceName, props, group = "default", propertyName, validationFunction) {

        const getPieceTypeByName = (typeName) => {
            let type = null;
            this.pieceTypes.forEach(input => {
                if (input.type === typeName)
                    type = input;
            });
            return type;
        }

        let pieceType = getPieceTypeByName(pieceName);

        if (!pieceType)
            throw new ErrorHandler("ERR:03", { pieceType: pieceName });
        if (!propertyName)
            propertyName = pieceType.propertyName;

        //default opts set
        if (!props || Object.keys(props).length === 0)
            props = {};
        if (!props.hasOwnProperty('allowValidationMessages'))
            props.allowValidationMessages = true;
        if (pieceType === this.CREDIT_CARD)
            props.cleanMask = true;
        //

        let elem = document.querySelector(place);
        if (!elem)
            throw new ErrorHandler("ERR:02", { placeReference: place });

        if (pieceType === this.FORMATTED_FIELD || pieceType === this.INPUT_FIELD) {
            if (!propertyName)
                throw new ErrorHandler("ERR:04");
            if (pieceType === this.FORMATTED_FIELD && !props.pattern)
                throw new ErrorHandler("ERR:05");
        }
        if (pieceType === this.INSTALLMENT_SELECTOR || pieceType === this.SELECT_FIELD) {
            if (!props.options)
                throw new ErrorHandler("ERR:12", { pieceType: pieceType.name })
            else { // check if the options is a array of {key, value} object
                if (Array.isArray(props.options)) {
                    props.options.forEach((option, i) => {
                        if (!option.hasOwnProperty("key") || !option.hasOwnProperty("value"))
                            throw new ErrorHandler("ERR:13", { pieceType: pieceType.name })
                    });
                } else
                    throw new ErrorHandler("ERR:13")
            }
        }
        if (pieceType === this.DOCUMENT) {
            if (!props.buyerDocumentFormatter)
                throw new ErrorHandler("ERR:11");
            if (!props.buyerDocumentFormatter instanceof BuyerDocumentFormatter)
                throw new ErrorHandler("ERR:10");
            validationFunction = props.buyerDocumentFormatter.validationFunction;
        }
        if (pieceType === this.QRCODE_PAYMENT_BOX) {
            if (props.instructions && !Array.isArray(props.instructions))
                throw new ErrorHandler("ERR:21");

            if (props.pixInfo == null && props.cryptoInfo == null)
                throw new ErrorHandler("ERR:31");
            if (props.pixInfo && props.cryptoInfo)
                throw new ErrorHandler("ERR:33");

            if (props.pixInfo) {
                if (!props.pixInfo.qrImage || typeof props.pixInfo.qrImage !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "qrImage" });
                if (!props.pixInfo.qrContent || typeof props.pixInfo.qrContent !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "qrContent" });
            }

            if (props.cryptoInfo) {
                if (!props.cryptoInfo.coinValue || typeof props.cryptoInfo.coinValue !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "coinValue" });
                if (!props.cryptoInfo.coinRateCurrency || typeof props.cryptoInfo.coinRateCurrency !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "coinRateCurrency" });
                if (!props.cryptoInfo.coinAddr || typeof props.cryptoInfo.coinAddr !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "coinAddr" });
                if (!props.cryptoInfo.coinQRCodeUrl || typeof props.cryptoInfo.coinQRCodeUrl !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "coinQRCodeUrl" });
                if (!props.cryptoInfo.coin || typeof props.cryptoInfo.coin !== "string")
                    throw new ErrorHandler("ERR:32", { propName: "coin" });
            }
        }
        if (validationFunction && typeof validationFunction !== "function")
            throw new ErrorHandler("ERR:06");

        if (pieceType === this.MONTH_FIELD || pieceType === this.YEAR_FIELD) {
            props.fieldDataType = pieceType === this.MONTH_FIELD ? "month" : "year";
        }

        if (pieceType === this.CARD_HOLDER_NAME && !validationFunction) {
            validationFunction = val => val.trim() && val.trim().length <= 100;
        }

        if (propertyName !== pieceType.propertyName) {
            pieceType.propertyName = propertyName;
            pieceType.name = propertyName;
        }

        let riotComp = pieceType.component;


        let pieceID = `tpc_${Math.random().toString(18).substring(2)}`;

        props = { ...props, autocomplete: pieceType.autocomplete, id: pieceID };

        let component = riot.component(riotComp)(elem, props);


        let relativeToCreditCard;
        if (!props.relativeToCreditCard)
            relativeToCreditCard = [1];
        else if (Array.isArray(props.relativeToCreditCard))
            relativeToCreditCard = props.relativeToCreditCard;
        else
            relativeToCreditCard = [props.relativeToCreditCard];

        let newPiece = new Piece(
            place,
            pieceID,
            pieceType,
            props,
            component,
            validationFunction,
            group,
            relativeToCreditCard
        );

        if (!props.isEmbedded) {
            let mountedPiecesOnPlace = this.forgedPieces.get(place);

            if (mountedPiecesOnPlace)
                mountedPiecesOnPlace.push(newPiece);
            else
                this.forgedPieces.set(place, [newPiece]);
        }
        return newPiece;
    }

    destroy(piece, preserveRoot = true) {
        piece.unmountComponent(preserveRoot);
        const piecesAtPlace = this.forgedPieces.get(piece.place);
        if (piecesAtPlace)
            piecesAtPlace.splice(piecesAtPlace.indexOf(piece), 1);
    }

    executeOnPieces(func) {
        this.forgedPieces.forEach((pieceArray) => pieceArray.forEach((piece) => func(piece)));
    }

    getPiecesByGroup(group) {
        let pieces = [];
        this.forgedPieces.forEach(piece => {
            if (piece.getGroup() === group)
                pieces.push(piece);
        });
        return pieces;
    }
}

export default PieceManager;