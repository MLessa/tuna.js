import Configs from "./config.js";

export default class googlePayResolver {

    constructor(settings, beforeClickFunction, checkoutCallbackFunction, env) {
        this.env = env;
        this.paymentClients = null;
        this.environment = Configs[this.env].GOOGLE_PAY_ENV;
        this.baseRequestConfig = {
            apiVersion: 2,
            apiVersionMinor: 0
        };

        this.settings = settings;
        this.checkoutCallbackFunction = checkoutCallbackFunction;
        this.beforeClickFunction = beforeClickFunction;
    }

    getPaymentsClient() {
        if (this.paymentClients === null) {
            this.paymentClients = new google.payments.api.PaymentsClient({ environment: this.environment });
        }
        return this.paymentClients;
    }

    addGooglePayButton(container) {
        const paymentsClient = this.getPaymentsClient();
        const button = paymentsClient.createButton({ onClick: _ => this.onGooglePayButtonClicked() });
        document.querySelector(container).appendChild(button);
    }

    onGooglePayButtonClicked() {
        try {
            let screenData = this.beforeClickFunction();

            const paymentDataRequest = this.getPaymentDataRequest();

            const paymentsClient = this.getPaymentsClient();
            this.checkoutCallbackFunction(paymentsClient.loadPaymentData(paymentDataRequest), screenData);
        } catch (e) {
            this.checkoutCallbackFunction(new Promise((resolve, reject) => reject(e)), null);
        }
    }

    getPaymentDataRequest() {
        const paymentDataRequest = Object.assign({}, this.baseRequestConfig);
        paymentDataRequest.allowedPaymentMethods = [this.cardPaymentMethod];

        paymentDataRequest.transactionInfo = {
            countryCode: 'BR',
            currencyCode: 'BRL',
            totalPriceStatus: 'NOT_CURRENTLY_KNOWN'
        };

        paymentDataRequest.merchantInfo = {
            // @todo a merchant ID is available for a production environment after approval by Google
            // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
            merchantId: Configs[this.env].GOOGLE_PAY_MERCHANT_ID,
            merchantName: Configs[this.env].GOOGLE_PAY_MERCHANT_NAME
        };
        return paymentDataRequest;
    }

    init(selector) {
        // Filling config properties
        let tokenizationSpecification = {
            type: 'PAYMENT_GATEWAY',
            parameters: this.settings.gatewayParameters
        };

        this.cardPaymentMethod = {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: this.settings.cardAuthMethods,
                allowedCardNetworks: this.settings.cardNetworks
            },
            tokenizationSpecification: tokenizationSpecification
        };
        ///

        // Adding GooglePay lib
        this.injectScript('https://pay.google.com/gp/p/js/pay.js')
            .then(_ => this.onLoaded(_ => this.addGooglePayButton(selector)))
            .catch(error => {
                console.error(error);
            });
        ///

    }

    onLoaded(onLoadFunction) {
        const paymentsClient = this.getPaymentsClient();

        var paymentConfig = Object.assign({},
            this.baseRequestConfig,
            {
                allowedPaymentMethods: [this.cardPaymentMethod]
            }
        );

        paymentsClient.isReadyToPay(paymentConfig)
            .then(function (response) {
                if (response.result) {
                    onLoadFunction();
                    // @todo prefetch payment data to improve performance after confirming site functionality
                    // prefetchGooglePaymentData();
                }
            })
            .catch(function (e) {
                throw e
            });
    }

    injectScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.addEventListener('load', resolve);
            script.addEventListener('error', e => reject(e.error));
            document.head.appendChild(script);
        });
    }
}