'use strict';

const eslintConfigArisor = require('..');
const assert = require('assert').strict;

assert.strictEqual(eslintConfigArisor(), 'Hello from eslintConfigArisor');
console.info('eslintConfigArisor tests passed');
