"use strict";

const fs = require('fs');
const stream = require('stream');
const csv = require('csv-parser');
const argparse = require('argparse');
const Dispatcher = require('../lib/sparql-dispatcher');
const Retriever = require('../lib/label-retriever');

const humanProperties = require('./human_properties.json');

const q = `select distinct ?vLabel where {
  wd:$PERSON_ID wdt:$PROPERTY_ID ?v.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`;

function getExampleValues(property_id, limit, output) {
    const dispatcher = new Dispatcher();
    const examples = [];

    fs.createReadStream('./human.csv')
        .pipe(csv(['id', 'value']))
        .pipe(new stream.Writable({
            objectMode: true,

            async write (row, encoding, callback) {
                if (examples.length >= limit) { callback(); return; }
                const query = q.replace('$PERSON_ID', row.id).replace('$PROPERTY_ID', property_id);
                try {
                    const example = await dispatcher.query(query);
                    example.results.bindings.forEach((item) => {
                        examples.push(item.vLabel.value);
                    });
                    console.log(`retrieved ${property_id} for ${row.id}`);
                } catch (e) {
                    console.log(`failed retrieving information for ${row.id}. `);
                    console.log(e.message);
                }
                callback();
            },

            final(callback) {
                const wstream = fs.createWriteStream(output, { encoding: 'utf8' });
                examples.forEach( async (e) => {
                    console.log(e);
                    await wstream.write(e + '\n');
                });
                wstream.close();
                callback();
            }
        })
    );
}

function getLabel(property) {
    const retriever = new Retriever();
    return retriever.retrieve(property);
}

async function main() {
    const argparser = new argparse.ArgumentParser({
        addHelp: true,
        description: 'Retrieve example values of a given property from wikidata'
    });
    argparser.addArgument(['-p', '--property'], {
        required: true,
        help: 'The id of the property, "all" to retrieve all values for human'
    });
    argparser.addArgument(['-l', '--limit'], {
        required: false,
        type: parseInt,
        defaultValue: 100,
        help: 'The number of example values to retrieve'
    });
    argparser.addArgument(['-o', '--output'], {
        required: false,
        help: 'The path of the output file'
    });

    const args = argparser.parseArgs();
    const property = args.property;
    const limit = args.limit;
    if (property === 'all') {
        for (let p of humanProperties) {
            const label = p.label;
            console.log(`retrieved label "${label}", now retrieving example values ...`);
            const output = '../string_values/' + label.replace(/ /g, '_') + '.tsv';
            await getExampleValues(p.id, limit , output);
        }
    } else {
        const output = '../string_values/' + (args.output ? args.output : (await getLabel(property)).replace(/ /g, '_') + '.tsv');
        getExampleValues(property, limit, output);
    }
}


main();
