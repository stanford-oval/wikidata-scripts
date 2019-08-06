"use strict";

const Tp = require('thingpedia');
const fs = require('fs');
const argparse = require('argparse');
const tough = require('tough-cookie');
const minidom = require('../util/minidom');
const assert = require('assert');

const humanProperties = require('./human_properties.json');

function accumulateStream(stream) {
    return new Promise((resolve, reject) => {
        const buffers = [];
        let length = 0;
        stream.on('data', (buf) => {
            buffers.push(buf);
            length += buf.length;
        });
        stream.on('end', () => resolve(Buffer.concat(buffers, length)));
        stream.on('error', reject);
    });
}

function getCsrfToken(htmlString) {
    for (let input of minidom.getElementsByTagName(minidom.parse(htmlString), 'input')) {
        if (minidom.getAttribute(input, 'name') === '_csrf')
            return minidom.getAttribute(input, 'value');
    }

    throw new Error('Failed to find input[name=_csrf]');
}
const baseUrl = 'https://almond-dev.stanford.edu';

async function startSession() {
    const loginStream = await Tp.Helpers.Http.getStream(baseUrl + '/user/login');
    const cookieHeader = loginStream.headers['set-cookie'][0];
    assert(cookieHeader);
    const cookie = tough.Cookie.parse(cookieHeader);

    const loginResponse = (await accumulateStream(loginStream)).toString();
    const csrfToken = getCsrfToken(loginResponse);
    return { csrfToken, cookie: cookie.cookieString() };
}

async function login(username, password, session) {
    if (!session)
        session = await startSession();

    await Tp.Helpers.Http.post(baseUrl + '/user/login',
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&_csrf=${encodeURIComponent(session.csrfToken)}`, {
            dataContentType: 'application/x-www-form-urlencoded',
            extraHeaders: {
                'Cookie': session.cookie
            }
        });
    return session;
}

async function main() {
    const argparser = new argparse.ArgumentParser({
        addHelp: true,
        description: 'Download string datasets from Thingpedia, developer account required.'
    });
    argparser.addArgument(['-u', '--username'], {
        required: true,
        help: 'The username of the developer account'
    });
    argparser.addArgument(['-p', '--password'], {
        required: true,
        help: 'The password of the developer account'
    });
    argparser.addArgument(['-o', '--output'], {
        required: false,
        defaultValue: __dirname + '/../data/',
        help: 'The directory to store all the files, default to ../data/'
    });
    argparser.addArgument(['--thingpedia'], {
        required: false,
        defaultValue: 'https://almond-dev.stanford.edu/thingpedia',
        help: 'Thingpedia url'
    });

    const args = argparser.parseArgs();
    const { cookie } = await login(args.username, args.password);
    console.log(cookie);

    for (let p of humanProperties) {
        if (p.string_values) {
            const fname = p.string_values.replace(':', '_') + '.tsv';
            Tp.Helpers.Http.get(args.thingpedia + '/strings/download/' + p.string_values, {
                extraHeaders: { Cookie: cookie }
            }).then((response) => {
                if (response.length === 0 && p.label.endsWith('ID'))
                    response = Math.random().toString(36).substring(2, 15);
                fs.writeFile(args.output + `${fname}`, response, (err) => {
                    if (err)
                        console.log(err);
                    console.log(`${fname} saved.`);
                });
            });
        }
    }
}

main();
