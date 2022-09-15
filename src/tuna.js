import ErrorHandler from "./support/errorHandler.js";
import { TunaAPI } from "./tuna-api.js";
import PieceManager from "./dom/pieceManager.js";
import { BuyerDocumentFormatter, BrazilianDocumentFormatter } from "./support/buyerDocumentFormatter.js";
import GooglePayResolver from "./support/googlePayResolver.js"

class Tuna extends TunaAPI {

  constructor(sessionID, env, antifraudConfig) {
    super(sessionID, env, antifraudConfig);
    this.isCheckoutRunning = false;
    this.pieceManagerObject = new PieceManager();
  }

  getBuyerDocumentFormatter = locale => locale === "pt-BR" ? new BrazilianDocumentFormatter() : new BuyerDocumentFormatter();
  close3dsModal = _ => this.pieceManager().close3dsModal();
  pieceManager = _ => this.pieceManagerObject;
  clearSavedCardSelector = _ => this.pieceManager().executeOnPieces(piece => piece.getType() === this.pieceManager().SAVED_CARD_LIST ? piece.clear() : '');

  useGooglePay(googlePayBtnContainerSelector, googlePaySettings, checkoutCallbackFunction, validationGroup) {
    if (!("cardAuthMethods" in googlePaySettings)
      || !("cardNetworks" in googlePaySettings)
      || !("gatewayParameters" in googlePaySettings))
      throw new ErrorHandler("ERR:19");

    if (!checkoutCallbackFunction || typeof checkoutCallbackFunction !== "function")
      throw new ErrorHandler("ERR:09");

    if (document.querySelector(googlePayBtnContainerSelector)) {

      const onGooglePayButtonClicked = validationGroup => {
        let validationGroupArray = [];
        if (validationGroup) {
          if (typeof validationGroup === "string")
            validationGroupArray = [validationGroup];
          else if (Array.isArray(validationGroup))
            validationGroupArray = validationGroup
        }

        this.isCheckoutRunning = true;
        try {
          let screenFields;
          if (validationGroupArray.length > 0) {
            screenFields = getCardDataMap(this, validationGroupArray);
          }
          setTimeout(_ => this.isCheckoutRunning = false, 500);
          return screenFields;
        } catch (e) {
          this.isCheckoutRunning = false;
          throw e;
        }
      }

      this.googlePayResolver = new GooglePayResolver(
        googlePaySettings,
        _ => onGooglePayButtonClicked(validationGroup),
        checkoutCallbackFunction);

      this.googlePayResolver.init(googlePayBtnContainerSelector);
    }
    else
      throw new ErrorHandler("ERR:18", { selector: googlePayBtnContainerSelector });
  }

  forgeDefaultForm(place, options) {
    console.warn("DEPRECATED. Use useDefaultForm method instead forgeDefaultForm");
    this.useDefaultForm(place, options);
  }

  useDefaultForm(place, options) {

    if (!options.checkoutCallback && !options.checkoutAndPayConfig)
      throw new ErrorHandler("ERR:25");

    if (options.checkoutAndPayConfig && typeof options.checkoutAndPayConfig !== "object")
      throw new ErrorHandler("ERR:26");

    if (options.checkoutAndPayConfig) {

      if (typeof options.checkoutAndPayConfig.totalPaymentAmount !== "number" || options.checkoutAndPayConfig.totalPaymentAmount <= 0)
        throw new ErrorHandler("ERR:27");
      if (typeof options.checkoutAndPayConfig.paymentMethodAmount !== "number" || options.checkoutAndPayConfig.paymentMethodAmount <= 0)
        throw new ErrorHandler("ERR:28");
      if (typeof options.checkoutAndPayConfig.callbackFunction !== "function")
        throw new ErrorHandler("ERR:29");

      if (options.customAreas) {
        if (!Array.isArray(options.customAreas))
          options.customAreas = [options.customAreas];

        options.customAreas.forEach(customArea => {
          if (!customArea.title)
            throw new ErrorHandler("ERR:38");
          if (!customArea.fields)
            throw new ErrorHandler("ERR:39");
        });
      }

    }

    this.pieceManager().createPiece(place, "defaultForm",
      {
        interfaceManager: this,
        pieceManager: this.pieceManager(),
        options: options || {}
      });
  }

  useQrCodePayment(place, options, paymentCallback, group = "default") {

    if (!paymentCallback || typeof paymentCallback !== "function")
      throw new ErrorHandler("ERR:24");

    if (!options || options.methodID === "undefined" || typeof options.methodID !== "number")
      throw new ErrorHandler("ERR:32", { propName: "methodID" });

    if (!options.paymentKey || typeof options.paymentKey !== "string")
      throw new ErrorHandler("ERR:32", { propName: "paymentKey" });

    this.pieceManager().createPiece(place, "qrCodePaymentBox", options, group);

    this.doStatusLongPolling(paymentCallback, options.methodID, options.paymentKey);
  }

  async useSavedCardSelector(place, options, group = "default") {
    let skeletonPiece;
    const pieceManager = this.pieceManager();

    validateCardSelectorParameters(pieceManager, options);

    skeletonPiece = pieceManager.createPiece(place, "savedCardSkeleton");

    let response = await this.tokenizator().list();
    if (response && response.code === 1 && response.tokens && response.tokens.length > 0) {
      if (skeletonPiece)
        pieceManager.destroy(skeletonPiece);

      pieceManager.createPiece(place, "savedCardSelector", {
        tokens: response.tokens,
        pieceManager: pieceManager,
        ...options
      }, group);

      return response.tokens.length;
    } else {
      if (skeletonPiece)
        pieceManager.destroy(skeletonPiece);
      return 0;
    }
  }

  async checkoutAndPay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, callbackFunction, customer) {

    if (this.isCheckoutRunning)
      throw new ErrorHandler("ERR:14");

    if (!callbackFunction || (callbackFunction && typeof callbackFunction !== "function"))
      throw new ErrorHandler("ERR:09");

    try {
      this.isCheckoutRunning = true;
      let checkoutData = null;

      if (paymentMethodType === "creditCard" || paymentMethodType === "voucher") {

        checkoutData = await prepareCheckout(this);

        if (!Array.isArray(checkoutData)) {
          if (!checkoutData.success) {
            this.isCheckoutRunning = false;
            callbackFunction({ success: false, message: checkoutData.message });
            return;
          }

          const authenticationInformation = checkoutData?.tokenData?.authenticationInformation;

          if (authenticationInformation && authenticationInformation.accessToken && authenticationInformation.deviceDataCollectionUrl) {
            this.create3DSDataCollectionFrame(authenticationInformation, async status => {
              if (status === true) {
                try {
                  const paymentResponse = await this.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData, customer);
                  callbackFunction({ success: true, data: paymentResponse });
                } catch (e) {
                  callbackFunction({ success: false, message: e.message });
                }
              }
              else
                callbackFunction({ success: false, message: new ErrorHandler("ERR:41").message });
              this.isCheckoutRunning = false;
            });
            return;
          }
        }
      }

      const paymentResponse = await this.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData, customer);
      callbackFunction({ success: true, data: paymentResponse });
      this.isCheckoutRunning = false;
    } catch (e) {
      this.isCheckoutRunning = false;
      callbackFunction({ success: false, message: e.message });
    }
  }

  async checkout(callbackFunction) {
    if (this.isCheckoutRunning)
      throw new ErrorHandler("ERR:14");

    this.isCheckoutRunning = true;

    let prepearedCheckout;
    try {
      prepearedCheckout = await prepareCheckout(this);
    } finally {
      this.isCheckoutRunning = false;
    }

    if (callbackFunction && typeof callbackFunction === "function") {
      callbackFunction(prepearedCheckout);
      return;
    }
    return prepearedCheckout;
  }

  open3dsModal(threeDSInfo, methodID, paymentKey, responseCallback) {
    const elemDiv = document.createElement('div');
    const divID = `tds_${Math.random().toString(18).substring(2)}`;
    elemDiv.id = divID;
    document.body.appendChild(elemDiv);
    this.pieceManager().createPiece(`#${divID}`, "threeDSModal", { threeDSInfo });
    this.doStatusLongPolling(responseCallback, methodID, paymentKey);
  }

  create3DSDataCollectionFrame({ accessToken, deviceDataCollectionUrl }, onDataCollectionScriptReady) {
    const elemDiv = document.createElement('div');
    const divID = `tds_${Math.random().toString(18).substring(2)}`;
    elemDiv.id = divID;
    document.body.appendChild(elemDiv);
    this.pieceManager().createPiece(`#${divID}`, "threeDSDataCollectionFrame", { accessToken, deviceDataCollectionUrl });

    window.addEventListener("message", async event => {
      if (event.origin === "https://centinelapistag.cardinalcommerce.com")
        onDataCollectionScriptReady(JSON.parse(event.data).Status);
    }, false);
  }
}

function validateCardSelectorParameters(pieceManager, options) {
  let savedCardSelectorPieces = [];
  pieceManager.executeOnPieces(piece => {
    if (piece.type == pieceManager.SAVED_CARD_LIST) {
      savedCardSelectorPieces.push(piece);
    }
  });

  if (savedCardSelectorPieces.length > 0 && !options.relativeToCreditCard)
    throw new ErrorHandler("ERR:01");

  if (options.relativeToCreditCard && typeof options.relativeToCreditCard !== 'number')
    throw new ErrorHandler("ERR:15");

  for (let i = 0; i < savedCardSelectorPieces.length; i++) {
    const scardSelectorPiece = savedCardSelectorPieces[i];
    if (scardSelectorPiece.relativeToCreditCard == options.relativeToCreditCard) {
      throw new ErrorHandler("ERR:20", { cardID: options.relativeToCreditCard });
    }
  }
  return true;
}

async function prepareCheckout(tunaObject) {

  let cardDataMap = getCardDataMap(tunaObject);

  if (!cardDataMap || cardDataMap.size == 0)
    return { success: false, message: "There is no data to perform checkout" };

  const getCheckoutDataFromSavedCard = async valuesFromPieces => {
    if (valuesFromPieces.savedCard != null) {
      let savedCard = valuesFromPieces.savedCard;

      let response = await bindSavedCard(savedCard, tunaObject.tokenizator());

      delete valuesFromPieces.savedCard;

      response.cardData = { ...response.cardData, ...valuesFromPieces };
      return response;
    }
    return null;
  };

  let response = null;

  for (const cardData of cardDataMap.values()) {
    let checkoutData;
    try {
      checkoutData = await getCheckoutDataFromSavedCard(cardData) || await tunaObject.getCheckoutData(cardData);
    } catch (e) {
      checkoutData = { success: false, tokenData: null, cardData: null, message: e.message };
    }
    if (response === null)
      response = checkoutData;
    else if (!Array.isArray(response))
      response = [response, checkoutData];
    else
      response.push(checkoutData);
  }
  return response;
}

function getCardDataMap(tunaObject, validationGroupArray = null) {
  let response = new Map();
  let invalidFieldPropertyNames = [];

  tunaObject.pieceManager().executeOnPieces(piece => {
    if (validationGroupArray === null || (Array.isArray(validationGroupArray) && validationGroupArray.includes(piece.getGroup()))) {

      let pieceType = piece.getType();

      if (pieceType.propertyName && piece.isEnabled) {
        try {
          let value = piece.getValue();

          piece.relativeToCreditCard.forEach(creditCardID => {

            let cardData = response.get(creditCardID);
            if (!cardData)
              cardData = {};

            if (pieceType.propertyName === "expiration" && value) {
              cardData = {
                ...cardData,
                "expirationYear": value.expirationYear,
                "expirationMonth": value.expirationMonth
              };
            } else if (piece.opts.resultingObject) {
              cardData = { ...cardData, [piece.opts.resultingObject]: { ...cardData[piece.opts.resultingObject], [pieceType.propertyName]: value } };
            } else {
              if (pieceType.type === "savedCardSelector" && cardData[pieceType.propertyName])
                cardData = { ...cardData, [pieceType.propertyName]: [{ ...cardData[pieceType.propertyName] }, value] };
              else
                cardData = { ...cardData, [pieceType.propertyName]: value };
            }
            response.set(creditCardID, cardData);
          });

        } catch {
          invalidFieldPropertyNames.push(pieceType.propertyName);
        }
      } else if (!piece.isEnabled) {
        piece.resetInvalidMarkup();
      }
    }
  });

  if (invalidFieldPropertyNames.length > 0)
    throw new ErrorHandler("ERR:07", { fieldNames: invalidFieldPropertyNames.join(", ") });

  if (response.singleUse !== undefined) {
    // At screen, the common is use "save card" checkbox. Once the tokenization expects a "single use" flag, the value need to be inverted
    response.singleUse = !response.singleUse;
  }
  return response;
}

async function bindSavedCard(savedCard, tokenizator) {
  let bindedToken = await tokenizator.bind(savedCard.token, savedCard.cvv);

  if (!bindedToken || bindedToken.code !== 1)
    throw new ErrorHandler("ERR:17");

  let tokenData = { brand: savedCard.brand, token: savedCard.token, code: 1 };

  delete savedCard.brand;
  delete savedCard.token;
  delete savedCard.cvv;

  return {
    success: true,
    tokenData: {
      ...tokenData,
      authenticationInformation: bindedToken.authenticationInformation
    },
    cardData: savedCard
  };
}

export default function factory(sessionID, env = "production", antifraudConfig = null) {
  if (sessionID)
    return new Tuna(sessionID, env, antifraudConfig);
  else
    throw new ErrorHandler("ERR:34");
}