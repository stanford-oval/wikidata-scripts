"use strict";

const fs = require('fs');
const humanProperties = require('./human_properties.json');

const base = `class @org.wikidata {
    import loader from @org.thingpedia.v2();
    import config from @org.thingpedia.config.none();    
    $QUERIES
}`;

const q = `
    list query $NAME($PARAMS
    )
    #_[canonical="$CANONICAL"]
    #_[confirmation="$CONFIRMATION"]
    #[doc="$DOC"];
`;

const param_with_examples = `
        out $NAME: $TYPE #_[canonical="$CANONICAL"] #[string_values="$STRING_VALUES"]`;

const param_without_examples = `
        out $NAME: $TYPE #_[canonical="$CANONICAL"]`;

function generateQuery(name, params, canonical, confirmation, doc) {
    const param_list = [];
    for (let p of params)
        param_list.push(generateParam(p));
    return q.replace('$NAME', name)
            .replace('$PARAMS', param_list.join(','))
            .replace('$CANONICAL', canonical)
            .replace('$CONFIRMATION', confirmation)
            .replace('$DOC', doc);
}

function generateParam(p) {
    if (p.string_values) {
        let param = param_with_examples.replace('$NAME', p.id).replace('$TYPE', p.type).replace('$CANONICAL', p.label);
        return param.replace('$STRING_VALUES', p.string_values);
    } else {
        return param_without_examples.replace('$NAME', p.id).replace('$TYPE', p.type).replace('$CANONICAL', p.label);
    }
}

async function generateHumanQuery() {
    const humanQuery = {
        name: 'person',
        canonical: 'wikidata human data',
        confirmation: 'wikidata human',
        doc: 'wikidata human queries'
    };
    const params = humanProperties;
    params.push({
        id: 'person',
        type: 'Entity(org.wikidata:human)',
        label: 'person',
    });
    humanQuery.params = params;
    return humanQuery;
}


function generateManifest(queries) {
    const query_list = [];
    queries.forEach((q) => {
        query_list.push((generateQuery(q.name, q.params, q.canonical, q.confirmation, q.doc)));
    });
    return base.replace('$QUERIES', query_list.join(''));

}

async function main() {
    const queries = [ await generateHumanQuery() ];

    const wstream = fs.createWriteStream('./manifest.tt', { encoding: 'utf8' });
    await wstream.write(generateManifest(queries) + '\n');
    wstream.close();

}

main();
