"use strict";

const assert = require('assert');
const { uriToID, idToUri } = require('../lib/utils');

function testUriToID() {
    assert.strictEqual(uriToID('http://www.wikidata.org/entity/P5'), 'P5');
}

function testIdToUri() {
    assert.strictEqual(idToUri('P5'), 'http://www.wikidata.org/entity/P5');
}

function main() {
    testUriToID();
    testIdToUri();
}

main();