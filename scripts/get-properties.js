"use strict";

const fs = require('fs');
const csv = require('csv-parser');
const stream = require('stream');

const Retriever = require('../lib/label-retriever');

function getProperties() {
    const retriever = new Retriever();
    const properties = [];
    fs.createReadStream('./human_properties.csv')
        .pipe(csv(['id', 'type']))
        .pipe(new stream.Writable({
            objectMode: true,

            async write (row, encoding, callback) {
                const p = {};
                p.id = row.id;
                p.label = await retriever.retrieve(row.id);
                p.type = row.type;
                if (['String', 'Array(String)', 'URL', 'Array(URL)'].includes(row.type)) {
                    p.string_values = `org.wikidata:${p.label.replace(/ /g, '_')}`
                }
                properties.push(p);
                callback();
            },

            final(callback) {
                fs.writeFileSync('./human_properties.json', JSON.stringify(properties, null, 2));
                callback();
            }
        })
    );
}

getProperties();
