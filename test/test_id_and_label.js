"use strict";

const assert = require('assert');
const IdRetriever = require('../lib/id-retriever');
const LabelRetriever = require('../lib/label-retriever');


async function testIdRetriever() {
    const retriever = new IdRetriever();
    assert.strictEqual(await retriever.retrieve('country of citizenship'), 'P27');
}

async function testLabelRetriever() {
    const retriever = new LabelRetriever();
    assert.strictEqual(await retriever.retrieve('P27'), 'country of citizenship');
}

function main() {
    testIdRetriever();
    testLabelRetriever();
}

main();