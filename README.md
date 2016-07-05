# webwhois [![CircleCI build status](https://img.shields.io/circleci/project/frdmn/webwhois.svg)](https://circleci.com/gh/frdmn/webwhois) [![devDependency status](https://david-dm.org/frdmn/webwhois/dev-status.svg)](https://david-dm.org/frdmn/webwhois#info=devDependencies)

Simple, web-based domain availability lookup system. Can be embedded or used as standalone frontend.

![](http://i.imgur.com/UuEWbVD.png)

## Features

- [RESTful backend/API](API.md)
- [AutoDNS WhoisProxy](https://www.internetx.com/domains/autodns/whoisproxy/) support
- Twitter Bootstrap based frontend
- reCAPTCHA support
- i18n/l10n
- Highly customizable/configurable

## API documentation

Please take a look at the [API.md](API.md) Markdown file for a detailed API documentation.

## Configuration

You can find a (commented) example configuration file in [`config.hjson.example`](config.hjson.example).

## Installation

1. Make sure you've installed all requirements:  

    ```shell
    npm install -g gulp bower
    ```

1. Clone this repository:  

    ```shell
    git clone https://github.com/frdmn/webwhois
    ```

1. Install the web libraries using Bower:  

    ```shell
    bower install
    ```

1. Run Gulp to compile assets:  

    ```shell
    gulp  
    ```

1. Start using `npm`:  

    ```shell
    npm start  
    ```

## Contributing

1. Fork it
1. Create your feature branch:  

    ```shell
    git checkout -b feature/my-new-feature
    ```

1. Commit your changes:  

    ```shell
    git commit -am 'Add some feature'
    ```

1. Push to the branch:  

    ```shell
    git push origin feature/my-new-feature
    ```

1. Submit a pull request

## Requirements / Dependencies

* AutoDNS [WhoisProxy](https://www.internetx.com/domains/autodns/whoisproxy/)
* Node >= 5.0 (Bower and Gulp)

## Version

1.1.0

## License

[MIT](LICENSE)
