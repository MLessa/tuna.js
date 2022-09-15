import Tokenizer from './tokenizer.js';
import ErrorHandler from "./support/errorHandler.js";
import Configs from "./support/config.js";
import antifraudScripts from "./support/antifraudScripts.js";

export class TunaAPI {

  constructor(sessionID, env, antifraudConfig) {
    if (!sessionID)
      throw new ErrorHandler("ERR:34");
    this.env = env;
    this.sessionID = sessionID;
    this.antifraudConfig = antifraudConfig;
    initAntiFrauds(this, antifraudConfig);
  }

  getSessionID = _ => this.sessionID;

  tokenizator = _ => {
    if (!this.tokenizer)
      this.tokenizer = new Tokenizer(this.sessionID, this.env);
    return this.tokenizer;
  }

  async getCheckoutData(cardData, resultCallback) {
    const isResponseByCallback = resultCallback && typeof resultCallback === "function";

    //Create a safe copy of the card data object
    let safeCardData = { ...cardData };
    safeCardData.maskedNumber = maskCardNumber(safeCardData.cardNumber);
    delete safeCardData["cvv"];
    delete safeCardData["cardNumber"];

    const tokenResponse = await this.tokenizator().generate(cardData);
    const result = { success: tokenResponse?.code === 1, tokenData: tokenResponse, cardData: safeCardData };
    if (isResponseByCallback) {
      resultCallback(result);
      return;
    }
    return result;
  }

  async pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData, customer) {

    const paymentMethods = [];

    switch (paymentMethodType) {
      case "creditCard":
      case "voucher":

        let successfullyTokenizedCards = [];

        if (!checkoutData)
          throw new ErrorHandler("ERR:37");

        if (Array.isArray(checkoutData)) {
          successfullyTokenizedCards = checkoutData.filter(checkoutDataItem => checkoutDataItem.success);

          if (successfullyTokenizedCards.length != checkoutData.length)
            throw new ErrorHandler("ERR:16");

        } else {
          if (!checkoutData.success)
            throw new ErrorHandler("ERR:16");
          else
            successfullyTokenizedCards.push(checkoutData);
        }

        if (!customer)
          customer = successfullyTokenizedCards[0].cardData?.customer;

        successfullyTokenizedCards.forEach(tokenizedCardData => {

          const { cardData, tokenData } = tokenizedCardData;

          try {
            const paymentMethod = {
              paymentMethodType: paymentMethodType == "creditCard" ? '1' : 'F',
              amount: paymentMethodAmount ?? cardData.amount,
              installments: paymentMethodType == 'voucher' ? 1 : cardData.installment || 1,
              cardInfo: {
                token: tokenData.token,
                brandName: tokenData.brand,
                saveCard: !cardData.singleUse,
                expirationMonth: cardData.expirationMonth,
                expirationYear: cardData.expirationYear,
                cardHolderName: cardData.cardHolderName,
                cardNumber: cardData.maskedNumber.trim()
              }
            };

            if (tokenData.authenticationInformation) {
              paymentMethod.authenticationInformation = {
                code: this.sessionID,
                referenceId: tokenData.authenticationInformation.referenceId,
                transactionId: tokenData.authenticationInformation.transactionId
              }
            }
            paymentMethods.push(paymentMethod);
          } catch {
            throw new ErrorHandler("ERR:42");
          }
        });
        break;
      case "pix":
        paymentMethods.push({ amount: paymentMethodAmount, paymentMethodType: 'D' });
        break;
      case "crypto":
        paymentMethods.push({ amount: paymentMethodAmount, paymentMethodType: 'E' });
        break;
      case "bankInvoice":
        paymentMethods.push({ amount: paymentMethodAmount, paymentMethodType: '3' });
        break;
      default:
        throw new ErrorHandler("ERR:36");
    }

    let initRequest = {
      tokenSession: this.getSessionID(),
      customer,
      paymentData: {
        amount: totalPaymentAmount,
        countryCode: "BR",
        paymentMethods: paymentMethods
      }
    };
    return await callInit(this, initRequest);
  }

  async doStatusLongPolling(callbackFunction, methodID, paymentKey) {
    try {
      const successStatuses = ['2', '8'];
      const failStatuses = ['4', '5', 'A', 'N'];

      const options = {
        method: 'post',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'x-tuna-token-session': this.getSessionID()
        },
        body: JSON.stringify({ MethodID: methodID, PaymentStatusList: [...successStatuses, ...failStatuses], PaymentKey: paymentKey })
      }

      let response = await (await fetch(`${Configs[this.env].INTEGRATIONS_API_URL}/StatusPoll`, options)).json();

      if (response.paymentMethodConfimed) {

        response.paymentApproved = false;

        if (successStatuses.includes(response.paymentStatusFound))
          response.paymentApproved = true;

        callbackFunction(response);
      }
      else if (response.allowRetry)
        await this.doStatusLongPolling(callbackFunction, methodID, paymentKey);
      else {
        response.paymentApproved = false;
        callbackFunction(response);
      }

    } catch (error) {
      callbackFunction({ code: -1, paymentMethodConfimed: false, allowRetry: false }, error);
    }
  }
}

function maskCardNumber(creditCardNumber) {
  if (!creditCardNumber || (creditCardNumber && typeof creditCardNumber !== "string"))
    return null;

  // clear formatting mask
  creditCardNumber = creditCardNumber.replace(/[^\da-zA-Z]/g, '');

  let maskedCreditCard = creditCardNumber.substring(0, 6) + "xxxxxx" + creditCardNumber.slice(-4);
  return maskedCreditCard;
}

async function callInit(tunaObject, initRequest) {
  try {
    const options = {
      method: 'post',
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
        'x-tuna-token-session': tunaObject.sessionID,
      },
      body: JSON.stringify(initRequest)
    }
    return await (await fetch(`${Configs[tunaObject.env].INTEGRATIONS_API_URL}/Init`, options)).json();

  } catch (error) {
    throw new ErrorHandler(error);
  }
}

async function initAntiFrauds(tunaObject, antifraudConfigs) {
  if (antifraudConfigs) {
    try {
      const options = {
        method: 'post',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
          'x-tuna-token-session': tunaObject.sessionID,
        },
      };

      let antiFraudServiceList = await (await fetch(`${Configs[tunaObject.env].INTEGRATIONS_API_URL}/ListAntifrauds`, options)).json();

      if (antiFraudServiceList && antiFraudServiceList.services && Array.isArray(antiFraudServiceList.services)) {

        antiFraudServiceList.services.forEach(service => {

          if (service.pluginConfiguration && service.pluginConfiguration.usePlugin) {

            antifraudScripts[service.name].forEach(script => {

              let tag = script.tag.replace("#key#", service.pluginConfiguration.key);

              if (service.name === "CyberSource") {
                tag = tag.replace("#orgid#", Configs[tunaObject.env].CYBERSOURCE_ORG_ID);
              }

              antifraudConfigs.forEach(config => {
                tag = tag.replaceAll(`#${config.key}#`, config.value);
              });

              const parser = Range.prototype.createContextualFragment.bind(document.createRange());
              document.getElementsByTagName(script.location)[0].appendChild(parser(tag));
            });
          }
        });
      }

    } catch (error) {
      throw new ErrorHandler("ERR:40");
    }
  }
}

export default function factory(sessionID, env = "production", antifraudConfig = null) {
  if (sessionID)
    return new TunaAPI(sessionID, env, antifraudConfig);
  else
    throw new ErrorHandler("ERR:34");
}
