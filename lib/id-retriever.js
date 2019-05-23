"use strict";

const Dispatcher = require('./sparql-dispatcher');
const { uriToID } = require('./utils');

module.exports = class IdRetriever {
    constructor() {
        this.dispatcher = new Dispatcher();
        this.q = `SELECT distinct ?item ?itemLabel ?itemDescription WHERE {     
            ?item ?label "LABEL"@en.                                                
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }     
        }`;
    }

    retrieve(label) {
        const query = this.q.replace('LABEL', label);
        return this.dispatcher.query(query).then((result) => {
            for (let item of result.results.bindings) {
                let uri = item.item.value;
                if (uri.startsWith('http://www.wikidata.org/entity/P'))
                    return uriToID(uri);
            }
        });
    }
};