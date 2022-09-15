import TunaAPI from '../tuna-api'
import Tokenizer from '../tokenizer'
import { jest } from '@jest/globals'
import ErrorHandler from "../support/errorHandler.js"

const sessionID = "1";
const tunaProd = TunaAPI(sessionID);

test('getSessionID should return the session ID sent to constructor', () => {
    expect(tunaProd.getSessionID()).toBe("1");
});

test('Should return "production" env when env not sent', () => {
    expect(tunaProd.env).toBe("production");
});

test('Should return as env the data sent to the contructor', () => {
    const tunaAux = TunaAPI("1", "sandbox");
    expect(tunaAux.env).toBe("sandbox");
});

test('Should return instance of Tokenizer and use the same instance always', () => {
    const tokenizer = tunaProd.tokenizator();
    expect(tokenizer).toBeInstanceOf(Tokenizer);
    const tokenizerAux = tunaProd.tokenizator();
    expect(tokenizer).toBe(tokenizerAux);
});

test('doStatusLongPolling should confirm payment', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: true, paymentStatusFound: '2' }));
    let tuna = TunaAPI("1");

    const callbackFunction = response => {
        expect(response).toMatchObject({ paymentMethodConfimed: true, paymentStatusFound: '2' });
    };

    await tuna.doStatusLongPolling(callbackFunction, 1, 2);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/StatusPoll",
        {
            "body": "{\"MethodID\":1,\"PaymentStatusList\":[\"2\",\"8\",\"4\",\"5\",\"A\",\"N\"],\"PaymentKey\":2}",
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"
        }
    );
});

test('doStatusLongPolling should polling 3 times and do not confirm payment', async () => {
    fetch.resetMocks();

    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: false, allowRetry: true }));
    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: false, allowRetry: true }));
    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: false, allowRetry: false }));

    const tuna = TunaAPI("1");

    const callbackFunction = (response) => {
        expect(response).toMatchObject({ paymentMethodConfimed: false, allowRetry: false });
    }

    await tuna.doStatusLongPolling(callbackFunction, 1, 2);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/StatusPoll",
        {
            "body": "{\"MethodID\":1,\"PaymentStatusList\":[\"2\",\"8\",\"4\",\"5\",\"A\",\"N\"],\"PaymentKey\":2}",
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"
        }
    );
    expect(fetch).toHaveBeenCalledTimes(3);
});

test('doStatusLongPolling should polling 3 times and confirm payment', async () => {
    fetch.resetMocks();

    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: false, allowRetry: true }));
    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: false, allowRetry: true }));
    fetch.mockResponseOnce(JSON.stringify({ paymentMethodConfimed: true, allowRetry: false, paymentStatusFound: '2' }));

    const tuna = TunaAPI("1");

    const callbackFunction = (response) => {
        expect(response).toMatchObject({ paymentMethodConfimed: true, allowRetry: false, paymentStatusFound: '2' });
    }

    await tuna.doStatusLongPolling(callbackFunction, 1, 2);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/StatusPoll",
        {
            "body": "{\"MethodID\":1,\"PaymentStatusList\":[\"2\",\"8\",\"4\",\"5\",\"A\",\"N\"],\"PaymentKey\":2}",
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"
        }
    );
    expect(fetch).toHaveBeenCalledTimes(3);
});

test('Tokenize should generate token and respond using callback', async () => {
    fetch.resetMocks();
    const tokenResponse = { code: 1, token: "token mock" };
    fetch.mockResponseOnce(JSON.stringify(tokenResponse));

    const creditCardData = {
        cardHolderName: "Mock valid Card Data",
        cardNumber: "5358411839923758",
        expirationYear: 2022,
        expirationMonth: 10,
        cvv: "125",
        singleUse: false,
        document: "63126609074",
        installment: "2"
    };

    const callbackFunction = jest.fn(result => {
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('tokenData');
        expect(result).toHaveProperty('cardData');
        expect(result.tokenData).toMatchObject(tokenResponse);
        expect(result.cardData).not.toHaveProperty('cardNumber');
        expect(result.cardData).not.toHaveProperty('cvv');
        expect(result.cardData).toHaveProperty('maskedNumber', '535841xxxxxx3758');
    });

    await tunaProd.getCheckoutData(creditCardData, callbackFunction);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(callbackFunction).toHaveBeenCalledTimes(1);
});


test('Tokenize should generate token and respond using return', async () => {
    fetch.resetMocks();
    const tokenResponse = { code: 1, token: "token mock" };
    fetch.mockResponseOnce(JSON.stringify(tokenResponse));

    const creditCardData = {
        cardHolderName: "Mock valid Card Data",
        cardNumber: "5358411839923758",
        expirationYear: 2022,
        expirationMonth: 10,
        cvv: "125",
        singleUse: false,
        document: "63126609074",
        installment: "2"
    };

    var response = await tunaProd.getCheckoutData(creditCardData);

    expect(response).toHaveProperty('success', true);

    expect(response).toHaveProperty('tokenData');
    expect(response.tokenData).toMatchObject(tokenResponse);

    expect(response).toHaveProperty('cardData');

    const cardData = response.cardData;
    expect(cardData).not.toHaveProperty('cardNumber');
    expect(cardData).not.toHaveProperty('cvv');
    expect(cardData).toHaveProperty('maskedNumber', '535841xxxxxx3758');

    expect(fetch).toHaveBeenCalledTimes(1);

});

test('Tokenize not succeed due invalid card data', async () => {
    fetch.resetMocks();
    const tokenResponse = { code: -1, token: "token mock" };
    fetch.mockResponseOnce(JSON.stringify(tokenResponse));

    const creditCardData = {
        cardHolderName: "Mock valid Card Data",
        cardNumber: "123",
        expirationYear: 2022,
        expirationMonth: 10,
        cvv: "125",
        singleUse: false,
        document: "63126609074",
        installment: "2"
    };

    await expect(async () => {
        await tunaProd.getCheckoutData(creditCardData);
    }).rejects.toThrow(new ErrorHandler("ERR:07", { fieldNames: 'cardNumber' }));

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Tokenize throw exception due invalid card data', async () => {
    fetch.resetMocks();
    const tokenResponse = { code: -1, token: "token mock" };
    fetch.mockResponseOnce(JSON.stringify(tokenResponse));

    const creditCardData = {
        cardHolderName: "Mock invalid Card Data",
        cardNumber: "123",
        expirationYear: 2022,
        expirationMonth: 10,
        cvv: "125",
        singleUse: false,
        document: "63126609074",
        installment: "2"
    };


    await expect(async () => {
        await tunaProd.getCheckoutData(creditCardData, _ => { });
    }).rejects.toThrow(new ErrorHandler("ERR:07", { fieldNames: 'cardNumber' }));

    expect(fetch).toHaveBeenCalledTimes(0);
});


test('Tokenize should throw exception due missing card expiration data', async () => {
    fetch.resetMocks();
    const tokenResponse = { code: -1, token: "token mock" };
    fetch.mockResponseOnce(JSON.stringify(tokenResponse));

    const creditCardData = {
        cardHolderName: "Mock invalid Card Data",
        cardNumber: "5358411839923758",
        cvv: "125",
        singleUse: false,
        document: "63126609074",
        installment: "2"
    };

    await expect(async () => {
        await tunaProd.getCheckoutData(creditCardData, _ => { });
    }).rejects.toThrow(new ErrorHandler("ERR:08", { notFilledFields: ["expirationMonth", "expirationYear"].join(",") }));

    expect(fetch).toHaveBeenCalledTimes(0);
});


test('Pay should throw error due invalid paymentMethodType', async () => {
    fetch.resetMocks();
    const paymentMethodType = "invalid", totalPaymentAmount = 1, paymentMethodAmount = 1, tokenizedCardData = {};

    await expect(async () => {
        await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, tokenizedCardData);
    }).rejects.toThrow(new ErrorHandler("ERR:36"));

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Pay should call payment production endpoint to pay with PIX', async () => {
    fetch.resetMocks();
    const paymentMethodType = "pix", totalPaymentAmount = 1, paymentMethodAmount = 1, tokenizedCardData = null;

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    var response = await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, tokenizedCardData);

    expect(response).toHaveProperty('code', 1);

    expect(response).toMatchObject(payResponse);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/Init",
        {
            "body": `{\"tokenSession\":\"${sessionID}\",\"paymentData\":{\"amount\":${totalPaymentAmount},\"countryCode\":\"BR\",\"paymentMethods\":[{\"amount\":${paymentMethodAmount},\"paymentMethodType\":\"D\"}]}}`,
            "headers": {
                "Content-type": "application/json; charset=UTF-8",
                "x-tuna-token-session": sessionID,
            },
            "method": "post",
        }
    );
    expect(fetch).toHaveBeenCalledTimes(1);
});

test('Pay should call payment production endpoint to pay with Crypto', async () => {
    fetch.resetMocks();
    const paymentMethodType = "crypto", totalPaymentAmount = 1, paymentMethodAmount = 1, tokenizedCardData = null;

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    var response = await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, tokenizedCardData);

    expect(response).toHaveProperty('code', 1);

    expect(response).toMatchObject(payResponse);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/Init",
        {
            "body": `{\"tokenSession\":\"${sessionID}\",\"paymentData\":{\"amount\":${totalPaymentAmount},\"countryCode\":\"BR\",\"paymentMethods\":[{\"amount\":${paymentMethodAmount},\"paymentMethodType\":\"E\"}]}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"

        }
    );
    expect(fetch).toHaveBeenCalledTimes(1);
});

test('Pay should call payment production endpoint to pay with bank invoice', async () => {
    fetch.resetMocks();
    const paymentMethodType = "bankInvoice", totalPaymentAmount = 1, paymentMethodAmount = 1, tokenizedCardData = null;

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    var response = await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, tokenizedCardData);

    expect(response).toHaveProperty('code', 1);

    expect(response).toMatchObject(payResponse);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/Init",
        {
            "body": `{\"tokenSession\":\"${sessionID}\",\"paymentData\":{\"amount\":${totalPaymentAmount},\"countryCode\":\"BR\",\"paymentMethods\":[{\"amount\":${paymentMethodAmount},\"paymentMethodType\":\"3\"}]}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"
        }
    );
    expect(fetch).toHaveBeenCalledTimes(1);
});

test('Pay should throw error due null checkoutData while paying with credit card', async () => {
    fetch.resetMocks();
    const paymentMethodType = "creditCard", totalPaymentAmount = 1, paymentMethodAmount = 1, checkoutData = null;

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    await expect(async () => {
        await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData);
    }).rejects.toThrow(new ErrorHandler("ERR:37"));

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Pay should throw due error invalid checkoutData while paying with credit card', async () => {
    fetch.resetMocks();
    const paymentMethodType = "creditCard", totalPaymentAmount = 1, paymentMethodAmount = 1,
        checkoutData = { success: true, tokenData: { token: "teste", brand: "Master" } };

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    await expect(async () => {
        await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData);
    }).rejects.toThrow(new ErrorHandler("ERR:42"));

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Pay should throw error due invalid checkoutData while paying with credit card', async () => {
    fetch.resetMocks();
    const paymentMethodType = "creditCard", totalPaymentAmount = 1, paymentMethodAmount = 1, checkoutData = { success: true };

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    await expect(async () => {
        await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData);
    }).rejects.toThrow(new ErrorHandler("ERR:42"));

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Pay should call payment production endpoint to pay with credit card', async () => {
    fetch.resetMocks();
    const paymentMethodType = "creditCard", totalPaymentAmount = 1, paymentMethodAmount = 1,
        checkoutData = {
            success: true,
            cardData: {
                installment: 1,
                singleUse: false,
                expirationMonth: 10,
                expirationYear: 2022,
                cardHolderName: "Joe Doe",
                maskedNumber: "41xxxxxxxx1"
            },
            tokenData: {
                token: "token",
                brand: "Visa"
            }
        };

    const payResponse = { code: 1 };
    fetch.mockResponseOnce(JSON.stringify(payResponse));

    var response = await tunaProd.pay(paymentMethodType, totalPaymentAmount, paymentMethodAmount, checkoutData);

    expect(response).toHaveProperty('code', 1);

    expect(response).toMatchObject(payResponse);

    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/integrations/plugin/Init",
        {
            "body": `{\"tokenSession\":\"${sessionID}\",\"paymentData\":{\"amount\":${totalPaymentAmount},\"countryCode\":\"BR\",\"paymentMethods\":[{\"paymentMethodType\":\"1\",\"amount\":${totalPaymentAmount},\"installments\":1,\"cardInfo\":{\"token\":\"token\",\"brandName\":\"Visa\",\"saveCard\":true,\"expirationMonth\":10,\"expirationYear\":2022,\"cardHolderName\":\"Joe Doe\",\"cardNumber\":\"41xxxxxxxx1\"}}]}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8", "x-tuna-token-session": sessionID },
            "method": "post"
        }
    );
    expect(fetch).toHaveBeenCalledTimes(1);
});