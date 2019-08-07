"use strict";

const fs = require('fs');
const Tp = require('thingpedia');
const FormData = require('form-data');

const url = 'https://almond-dev.stanford.edu/thingpedia/api/v3/strings/upload';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzNWE0MjFiOTZhMTM1MWNiZjI2MGQzMWU5Mjc2NGJhYzkyNzg3MGM2NDE4OWU1MTA0NGIyYjY1MWI1ZWIwZjUwIiwiYXVkIjoib2F1dGgyIiwic2NvcGUiOlsicHJvZmlsZSIsInVzZXItcmVhZCIsInVzZXItcmVhZC1yZXN1bHRzIiwidXNlci1leGVjLWNvbW1hbmQiLCJ1c2VyLXN5bmMiLCJkZXZlbG9wZXItcmVhZCIsImRldmVsb3Blci11cGxvYWQiLCJkZXZlbG9wZXItYWRtaW4iXSwiaWF0IjoxNTU4NDU5OTI2LCJleHAiOjE1NjEwNTE5MjZ9.vHgs0a4r2CUDSlOO1nbzuaOMQDbLVdTjXtmdHdZ8O14';

function createUpload(file, data) {
    const fd = new FormData();

    if (file)
        fd.append('upload', file, { filename: 'string.csv', contentType: 'text/csv;charset=utf8' });
    for (let key in data)
        fd.append(key, data[key]);
    return fd;
}

async function uploadOne(name, description, tsv) {
    const f = createUpload(tsv, {
        type_name: name,
        name: description,
        license: 'public-domain',
        preprocessed:''
    });

    await Tp.Helpers.Http.postStream(url, f, {
        dataContentType:  'multipart/form-data; boundary=' + f.getBoundary(),
        extraHeaders: {
            Authorization: 'Bearer ' + token
        },
        useOAuth2: true
    }).catch((e) => {
        console.log(e);
    });
}

async function main() {
    const human_params = require('../data/human_properties.json');
    for (let id in human_params) {
        if (human_params[id].string_values) {
            let label = human_params[id].label;
            let name = 'org.wikidata:' + label.replace(/ /g, '_');
            let description = label;
            let file = '../data/' + label.replace(/ /g, '_') + '.tsv';
            await uploadOne(name, description, fs.readFileSync(file).toString());
        }
    }
}

main();
