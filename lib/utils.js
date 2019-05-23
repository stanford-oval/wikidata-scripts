"use strict";

module.exports = {
    uriToID: function(uri) {
        return uri.substr('http://www.wikidata.org/entity/'.length);
    },

    idToUri: function(id) {
        return 'http://www.wikidata.org/entity/' + id;
    }
};