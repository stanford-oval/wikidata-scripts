"use strict";

const fetch = require('node-fetch');

module.exports = class SPARQLQueryDispatcher {
    constructor(endpoint) {
        this.endpoint = endpoint || 'https://query.wikidata.org/sparql';
    }

    query(sparqlQuery) {
        const url = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
        const headers = { 'Accept': 'application/json' };

        return fetch(url, { headers }).then((result) => {
            return result.json();
        });
    }
};
