// all tests, in batch form
"use strict";

process.on('unhandledRejection', (up) => { throw up; });

// require everything, to get a complete view of code coverage
require('../lib/id-retriever');
require('../lib/label-retriever');
require('../lib/sparql-dispatcher');
require('../lib/utils');
require('../scripts/get-examples');

async function seq(array) {
    for (let fn of array) {
        console.log(`Running ${fn}`);
        await require(fn)();
    }
}

seq([
    ('./test_utils'),
]);
