
# Tuna.js Library

The Tuna JavaScript library allow you to build a secure payment form, tokenize sensitive custumer card's information and accept payments rigth on your website or using your backend.


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![AppVeyor](https://img.shields.io/appveyor/build/gruntjs/grunt)
[![cdn](https://img.shields.io/badge/cdn-v1.0.2-yellow)](https://js.tuna.uy/tuna.js)
![npm](https://img.shields.io/npm/v/tuna-gateway?style=plastic)


## Building Locally

Building tuna libraries

```bash
  npm install
  yarn bundle
```
Building only tuna-api.js
```bash
  yarn bundleTunaAPI
```

Run tests
```bash
  yarn test
```
Run in debug mode
```bash
  yarn debug
```

## Installation on website

To use tuna.js to build your checkout form add

```bash
  <script src="https://js.tuna.uy/tuna.js"></script>
```

To use tuna.js API only

```bash
  <script src="https://js.tuna.uy/tuna-api.js"></script>
```

We strongly encourage the use of tuna.js via these links provided by us istead of a local copy of the file
## Usage example

```HTML
<html>
    <head>
        <script src="https://js.tuna.uy/tuna.js"></script>
    </head>
    <body>
        <span id="defaultFormRoot"></span>
        <script>
              let tuna = Tuna('61205-xxxx-2305');
              tuna.useDefaultForm("#defaultFormRoot",
                {
                    checkoutCallback: response => console.log(response),
                });
        </script>
    </body>
</html>
```

![Alt Text](https://storage.googleapis.com/tuna-statics/img/defaultForm.gif)



## Documentação

To more details, access the entire documentation at this [link](https://dev.tuna.uy/plugins/javascript)


## Licença

[MIT](https://choosealicense.com/licenses/mit/)

