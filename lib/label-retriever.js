"use strict";

const fetch = require('node-fetch');

const endpoint = `https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&ids=ID&languages=en&format=json`;

module.exports = class LabelRetriever {
    retrieve(id) {
        const url = endpoint.replace('ID', encodeURIComponent(id));
        const headers = { 'Accept': 'application/json' };

        return fetch(url, { headers }).then((result) => {
            return result.json();
        }).then((parsed) => {
            return parsed.entities[id].labels.en.value;
        });
    }
};