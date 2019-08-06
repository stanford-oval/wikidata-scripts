"use strict";

const assert = require('assert');
const Retriever = require('../lib/retriever');

async function testGetItemIdentifier(retriever) {
    const id = await retriever.getItemIdentifier('Barack Obama');
    assert.strictEqual(id, 'Q76');
}

async function testGetPropertyIdentifier(retriever) {
    const id = await retriever.getPropertyIdentifier('instance of');
    assert.strictEqual(id, 'P31');
}

async function testGetItemLabel(retriever) {
    const label = await retriever.getItemLabel('Q76');
    assert.strictEqual(label, 'Barack Obama');
}

async function testGetPropertyLabel(retriever) {
    const label = await retriever.getPropertyLabel('P31');
    assert.strictEqual(label, 'instance of');
}

async function testGetFreebaseEquivalentItem(retriever) {
    const id = await retriever.getFreebaseEquivalentItem('Q76');
    assert.strictEqual(id, '/m/02mjmr');
}

async function testGetWikidataEquivalentItem(retriever) {
    const id = await retriever.getWikidataEquivalentItem('/m/02mjmr');
    assert.strictEqual(id, 'Q76');
}

async function main() {
    const retriever = new Retriever();
    testGetItemIdentifier(retriever);
    testGetPropertyIdentifier(retriever);
    testGetItemLabel(retriever);
    testGetPropertyLabel(retriever);
    testGetFreebaseEquivalentItem(retriever);
    testGetWikidataEquivalentItem(retriever);
}

module.exports = main;
if (!module.parent)
    main();
