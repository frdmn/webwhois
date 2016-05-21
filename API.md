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
        "GET /api/lookup/domain/:domain": "Check availablity of a single domain",
        "POST /api/lookup/package": "Check availablity of multiple domain (TLDs)",
        "GET /api/whois/:domain": "Whois a single domain"
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

#### GET /api/lookup/single/:domain

Body Parameters:

*none*

Response:

```json
{
    "data": {
        "frd.de": false
    },
    "status": "success"
}
```

### Check availablity of multiple domains

#### POST /api/lookup/package

Body Parameters:

- **domain** (required)
- **package** (required)

Response:

```json
{
    "data": {
        "test.academy": false,
        "test.accountant": true,
        "test.accountants": true,
        "test.active": true,
        "test.actor": true
    },
    "status": "success"
}
```

### Raw whois lookup of a single domain

#### GET /api/whois/:domain

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
