"use strict";

const Dispatcher = require('./sparql-dispatcher');
const { uriToID } = require('./utils');

module.exports = class WikidataRetriever {
    constructor() {
        this.dispatcher = new Dispatcher();
    }

    async _getIdentifier(label, type) {
        const query = `SELECT distinct ?item ?itemLabel ?itemDescription WHERE {     
            ?item ?label "${label}"@en.                                                
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }     
        }`;
        const result = await this.dispatcher.query(query);
        for (let item of result.results.bindings) {
            let uri = item.item.value;
            if (uri.startsWith('http://www.wikidata.org/entity/' + (type === 'property' ? 'P' : 'Q')))
                return uriToID(uri);
        }
        return null;
    }

    async getItemIdentifier(label) {
        return this._getIdentifier(label, 'item');
    }

    async getPropertyIdentifier(label) {
        return this._getIdentifier(label, 'property');
    }

    async getItemLabel(id) {
        const query = `SELECT ?label WHERE {
            wd:${id} rdfs:label ?label .
            FILTER (langMatches( lang(?label), "en" ) )
        } LIMIT 1`;
        const result = await this.dispatcher.query(query);
        if (result.results.bindings.length > 0)
            return result.results.bindings[0].label.value;
        return null;
    }

    async getPropertyLabel(id) {
        const query = `SELECT DISTINCT ?propLabel WHERE {
             ?prop wikibase:directClaim wdt:${id}
             SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        } LIMIT 1`;
        const result = await this.dispatcher.query(query);
        if (result.results.bindings.length > 0)
            return result.results.bindings[0].propLabel.value;
        return null;

    }

    async getFreebaseEquivalentItem(wikidataId) {
        const query = `SELECT ?node WHERE {
            wd:${wikidataId} wdt:P646 ?node.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }`;
        const result = await this.dispatcher.query(query);
        if (result.results.bindings.length > 0)
            return result.results.bindings[0].node.value;
        return null;
    }

    async getWikidataEquivalentItem(freebaseId) {
        const query = `SELECT ?node WHERE {
            ?node wdt:P646 "${freebaseId}".
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }`;
        const result = await this.dispatcher.query(query);
        if (result.results.bindings.length > 0)
            return uriToID(result.results.bindings[0].node.value);
        return null;
    }
};
