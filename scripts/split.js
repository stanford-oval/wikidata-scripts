"use strict";

const fs = require('fs');
const csv = require('csv-parser');

const fields = [' P734 ', ' P1499 ', ' P40 ', ' P108 ', ' P1853 '];
const dataset = '/home/silei/Workspace/genie-toolkit/workdir-wikidata/augmented.tsv';

function coin(prob) {
    return Math.random() < prob;
}

function waitFinish(stream) {
    return new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

async function split_dataset() {
    const trainset = fs.createWriteStream('./train.tsv');
    const evalset = fs.createWriteStream('./eval.tsv');
    const testset = fs.createWriteStream('./test.tsv');
    fs.createReadStream(dataset)
        .pipe(csv({
            headers: ['id', 'utterance', 'thingtalk'],
            separator: '\t'
        }))
        .on('data', (row) => {
        let hasField = false;
        for (let f of fields)
            if (row.thingtalk.includes(f)) hasField = true;
        if (hasField) {
            if (coin(0.5))
                evalset.write(`${row.id}\t${row.utterance}\t${row.thingtalk}\n`);
            else
                testset.write(`${row.id}\t${row.utterance}\t${row.thingtalk}\n`);
        } else {
            trainset.write(`${row.id}\t${row.utterance}\t${row.thingtalk}\n`);
        }
    });

    await Promise.all([
        waitFinish(trainset),
        waitFinish(evalset),
        waitFinish(testset)
    ]);
}


split_dataset();
