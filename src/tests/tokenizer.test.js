import TunaAPI from '../tuna-api.js'
import ErrorHandler from "../support/errorHandler.js"

const productionSessionID = 1;
const sandboxSessionID = 2;
const tunaProd = TunaAPI(productionSessionID);
const tunaSandbox = TunaAPI(sandboxSessionID, "sandbox");
const tokenizator = tunaProd.tokenizator();
const tokenizatorSandbox = tunaSandbox.tokenizator();

test('bind should call production Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tokenizator.bind("token", "cvv");

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/Bind",
        {
            "body": `{\"SessionId\":${productionSessionID},\"token\":\"token\",\"cvv\":\"cvv\",\"authenticationInformation\":{\"code\":${productionSessionID}}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});

test('bind should call sandbox Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tunaSandbox.tokenizator().bind("token", "cvv");

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tuna-demo.uy/api/Token/Bind",
        {
            "body": `{\"SessionId\":${sandboxSessionID},\"token\":\"token\",\"cvv\":\"cvv\",\"authenticationInformation\":{\"code\":${sandboxSessionID}}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});

test('delete should call production Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tokenizator.delete("token");

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/Delete",
        {
            "body": `{\"SessionId\":${productionSessionID},\"token\":\"token\"}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "delete"
        }
    );
});

test('delete should call sandbox Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tunaSandbox.tokenizator().delete("token");

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tuna-demo.uy/api/Token/Delete",
        {
            "body": `{\"SessionId\":${sandboxSessionID},\"token\":\"token\"}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "delete"
        }
    );
});

test('list should call production Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tokenizator.list();

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/List",
        {
            "body": `{\"SessionId\":${productionSessionID}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});

test('list should call sandbox Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tunaSandbox.tokenizator().list();

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tuna-demo.uy/api/Token/List",
        {
            "body": `{\"SessionId\":${sandboxSessionID}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});


test('List should call production Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    let response = await tokenizator.list();

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/List",
        {
            "body": `{\"SessionId\":${productionSessionID}}`,
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});

test('Generate should call production Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));


    const ccard = {
        cardHolderName: "Holder name",
        cardNumber: "5303657995505112",
        expirationMonth: 12,
        expirationYear: 2022,
        singleUse: false,
        cvv: 123
    };

    let response = await tokenizator.generate(ccard);

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/Generate",
        {
            "body": JSON.stringify({ "SessionId": productionSessionID, card: ccard, "authenticationInformation": { code: productionSessionID } }),
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});

test('Generate should call sandbox Token API', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));


    const ccard = {
        cardHolderName: "Holder name",
        cardNumber: "5303657995505112",
        expirationMonth: 12,
        expirationYear: 2022,
        singleUse: false,
        cvv: 123
    };

    let response = await tokenizatorSandbox.generate(ccard);

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tuna-demo.uy/api/Token/Generate",
        {
            "body": JSON.stringify({ "SessionId": sandboxSessionID, card: ccard, "authenticationInformation": { code: sandboxSessionID } }),
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});


test('Generate should fail due the absence of mandatory credit card data', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));

    const ccard = {
        cardHolderName: "Holder name",
        cardNumber: "5303657995505112",
        expirationMonth: 12,
        expirationYear: 2022,
        singleUse: false,
        cvv: 123
    };

    try {
        const cardError = { ...ccard };
        delete cardError.cardHolderName;
        const a = await tokenizatorSandbox.generate(cardError);
    } catch (error) {
        expect(error).toBeInstanceOf(ErrorHandler);
    }

    try {
        const cardError = { ...ccard };
        delete cardError.cardNumber;
        const a = await tokenizatorSandbox.generate(cardError);
    } catch (error) {
        expect(error).toBeInstanceOf(ErrorHandler);
    }

    try {
        const cardError = { ...ccard };
        delete cardError.expirationMonth;
        const a = await tokenizatorSandbox.generate(cardError);
    } catch (error) {
        expect(error).toBeInstanceOf(ErrorHandler);
    }

    try {
        const cardError = { ...ccard };
        delete cardError.expirationYear;
        const a = await tokenizatorSandbox.generate(cardError);
    } catch (error) {
        expect(error).toBeInstanceOf(ErrorHandler);
    }

    expect(fetch).toHaveBeenCalledTimes(0);
});

test('Generate should call production Token API even without send the cvv', async () => {
    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({ mockedResponse: true }));


    const ccard = {
        cardHolderName: "Holder name",
        cardNumber: "5303657995505112",
        expirationMonth: 12,
        expirationYear: 2022,
        singleUse: false,
        // cvv: 123
    };

    let response = await tokenizator.generate(ccard);

    expect(response).toMatchObject({ mockedResponse: true });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith(
        "https://token.tunagateway.com/api/Token/Generate",
        {
            "body": JSON.stringify({ "SessionId": productionSessionID, card: ccard, "authenticationInformation": { code: productionSessionID } }),
            "headers": { "Content-type": "application/json; charset=UTF-8" },
            "method": "post"
        }
    );
});