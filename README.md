# crumbl-hoster
_Easy hosting server for the Crumbl&trade; platform_

![Github tag (latest by date)](https://img.shields.io/github/v/tag/cyrildever/crumbl-hoster)
![npm](https://img.shields.io/npm/dw/crumbl-hoster)
![Github last commit](https://img.shields.io/github/last-commit/cyrildever/crumbl-hoster)
![Github issues](https://img.shields.io/github/issues/cyrildever/crumbl-hoster)
![NPM](https://img.shields.io/npm/l/crumbl-hoster)

This application is an simple hosting service for the Crumbl&trade; technology patented by Cyril Dever.

### Usage

1. Either you have set your own MongoDB environment compatible with `crumbl-hoster`'s requirements:
    ```console
    npm i crumbl-hoster && npm run compile && npm start
    ```

2. Or you start the Docker container:
    ```console
    git clone https://github.com/cyrildever/crumbl-hoster.git && cd crumbl-hoster && docker-compose up --build -d
    ```
    You might want to use the `./cleanup` script (or `./cleanup.bat` on Windows) before launching any new Docker session (especially when you've built the NPM project).


Running the application will write a 'crumbl-hoster.log' file.

#### Production

Change or adapt the following environment variables if need be:
* `HTTP_PORT`: the HTTP port number (default: 8000);
* `MONGO_DOMAIN`: the MongoDB server name (default: localhost);
* `MONGO_PORT`: the MongoDB port number (default: 27017);
* `MONGO_DB`: the name of the MongoDB database (default: crumbl);
* `MONGO_USERNAME`: the MongoDB username;
* `MONGO_PASSWORD`: the MongoDB password for this username;
* `MONGO_COLLECTION`: the name of the collection to use (default: hoster).


### API

_// TODO Add headers identifying the requester._

The following endpoints are available:

* `GET /crumbl`

This endpoint returns the full crumbled string from the passed related hashered prefix of a Crumbl, eg. `http://localhost:8000/crumbl?hasheredSrc=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef&token=12345678-90ab-cdef-1234-567890abcdef1`

It expects 2 mandatory arguments:
- `hasheredSrc`: the hashered prefix of the Crumbl;
- `token`: a valid token (in the form of a UUID string).

It returns a `200` status code if found along with a JSON object in the body respecting the following format:
```json
{
  "crumbled": "<The full found crumbled string>",
  "hasheredSrc": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

* `POST /crumbl`

This endpoint records a crumbled string in the local database.
It expects the request body to be the full crumbled string, eg.
```console
$ curl --location --request POST 'localhost:8000/crumbl' --header 'Content-Type: text/plain' --data-raw '<The full crumbled string>'
```

It returns a `201` status code if success along with the verification hash string in the body.


### License
The use of the crumbl-hoster server is subject to fees for commercial purpose and to the respect of the [BSD2-Clause-Patent license](LICENSE).
Please [contact me](mailto:cdever@edgewhere.fr) to get further information.


<hr />
&copy; 2020 Cyril Dever. All rights reserved.