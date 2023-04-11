'use strict';

const yunLintCli = require('..');
const assert = require('assert').strict;

assert.strictEqual(yunLintCli(), 'Hello from yunLintCli');
console.info('yunLintCli tests passed');
