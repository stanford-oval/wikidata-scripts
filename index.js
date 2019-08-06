// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// This file is part of ThingTalk
//
// Copyright 2019 The Board of Trustees of the Leland Stanford Junior University
//
// Author: Silei Xu <silei@cs.stanford.edu>
//
// See COPYING for details
"use strict";

const Retriever = require('./lib/retriever');
const SPARQLQueryDispatcher = require('./lib/sparql-dispatcher');

module.exports = {
    Retriever,
    SPARQLQueryDispatcher
};
