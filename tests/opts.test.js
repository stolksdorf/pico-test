const test = require('../pico-check.js');
const opts = require('../src/getopts.js');

//console.log('opts', opts);

test('defaults', (t) => {
	t.is(opts.ignore, ['node_modules/**']);
	t.is(typeof opts.reporter, 'object');
});

//Should be populated by test.require.js
test('require', (t) => {
	t.ok(global.require_is_working);
});

test('opts from package', (t) => {
	t.is(opts.timeout, 1337);
	t.is(opts.source, ['../**/*.js']);
	t.is(opts.require, ['./test.require.js']);
});

module.exports = test;
