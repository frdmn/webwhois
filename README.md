# webwhois [![CircleCI build status](https://img.shields.io/circleci/project/frdmn/webwhois.svg)](https://circleci.com/gh/frdmn/webwhois) [![devDependency status](https://david-dm.org/frdmn/webwhois/dev-status.svg)](https://david-dm.org/frdmn/webwhois#info=devDependencies)

Simple, Lightweight and customizable domain lookup/whois system, which makes use of the @[phpWhois/phpWhois](https://github.com/phpWhois/phpWhois) library. Comes with REST support and can be embedded or used as standalone frontend.

![](http://up.frd.mn/cccR9UByHH.png)

## API documentation

### Get available API endpoints

#### GET /api

Body Parameters:

*none*

Response:

```json
{
    "data": {
        "GET /api": "This API overview",
        "GET /api/tlds": "List all available TLDs",
        "GET /api/lookup/single/{domain}": "Check availablity of a single domain",
        "POST /api/lookup/multi": "Check availablity of multiple domain (TLDs)",
        "GET /api/whois/{domain}": "Whois a single domain"
    },
    "status": "success"
}
```

### List supported TLDs

#### GET /api/tlds

Body Parameters:

*none*

Response:

```json
{
    "data": [
        "academy",
        "accountant",
        "accountants",
        "active",
        "actor",
        "biz",
        "com",
        "de",
        "info",
        "net",
        "[...]"
    ],
    "status": "success"
}
```

### Check availablity of a single domain

#### GET /api/lookup/single/{domain}

Body Parameters:

*none*

Response:

```json
{
    "data": {
        "frd.mn": {
            "registered": true,
            "status": "success"
        }
    },
    "status": "success"
}
```

### Check availablity of multiple domains

#### POST /api/lookup/multi

Body Parameters:

- **domain** (required)
- **tlds** (required) - One or multiple TLDs seperated by ', '

Response:

```json
{
    "data": {
        "frd.de": {
            "registered": true,
            "status": "success"
        },
        "frd.mn": {
            "registered": true,
            "status": "success"
        }
    },
    "status": "success"
}
```

### Raw whois lookup of a single domain

#### GET /api/whois/{domain}

Body Parameters:

*none*

Response:

```json
{
    "data": {
        "rawdata": [
            "Access to CCTLD WHOIS information is provided to assist persons in \r",
            "..."
        ],
        "regrinfo": {
            "domain": {
                "name": "frd.mn"
            },
            "registered": "yes"
        },
        "regyinfo": {
            "servers": [
                {
                    "args": "frd.mn",
                    "port": 43,
                    "server": "whois.nic.mn"
                }
            ],
            "type": "domain"
        }
    },
    "status": "success"
}
```

## Installation

1. Make sure you've installed all requirements:  

    ```shell
    npm install -g gulp bower
    ```

1. Clone this repository:  

    ```shell
    git clone https://github.com/frdmn/webwhois
    ```

1. Install PHP dependencies using Composer:  

    ```shell
    composer install
    ```

1. Install the web libraries using Bower:  

    ```shell
    bower install
    ```

1. Run Gulp to compile assets:  

    ```shell
    gulp  
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

* PHP >= 5.5 (Composer)
* Node >= 5.0 (Bower and Gulp)

## Version

0.0.1

## License

[MIT](LICENSE)
