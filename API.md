# API documentation

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
