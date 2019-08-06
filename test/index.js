// all tests, in batch form
"use strict";

process.on('unhandledRejection', (up) => { throw up; });

async function seq(array) {
    for (let fn of array) {
        console.log(`Running ${fn}`);
        await require(fn)();
    }
}

seq([
    ('./test_util'),
    ('./test_sparql_dispatcher'),
    ('./test_retriever')
]);
