const fs     = require('fs');
const path   = require('path');
const chalk  = require('chalk');
const Assert = require('../src/assert.js');

const codeDiff = require('../src/codediff.js');
const utils = require('../src/utils.js');

const InternalPaths = Object.keys(process.binding('natives'))
	.concat(['bootstrap_node', 'node'])
	.map((name)=>new RegExp(`${name}\\.js:\\d+:\\d+`))
	.concat([new RegExp(`\\\\pico-test\\\\src\\\\`)]);

const parseError = (err)=>{
	const newStack = err.stack.split('\n')
		.filter((line)=>!InternalPaths.some((regex)=>regex.test(line)))
		.map((line)=>line.replace(process.cwd(), '.'))
	const matches = /\((.*):(\d+):(\d+)/.exec(newStack[1]);
	if(!matches) return {
		stack : err.stack,
		file  : false,
		line  : '??',
		col   : '??'
	}
	return {
		file  : matches[1],
		stack : newStack.join('\n'),
		line  : Number(matches[2]),
		col   : Number(matches[3])
	};
};

// TODO: Move to Utils?
const pad = (string, pad='    ')=>(string + pad).substring(0, pad.length);
const indent = (string, pad='')=>string.split('\n').map((line)=>`${pad}${line}`).join('\n');

const codeSnippet = (file, line, col, indent='')=>{
	const code = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8').split('\n');
	const renderLine = (lineNum, color='grey')=>chalk[color](`${lineNum}:`.padEnd(5)) + code[lineNum - 1].replace(/\t/g, '  ');
	return [
		indent + renderLine(line-1),
		indent + chalk.bgRed.bold(renderLine(line, 'white')),
		indent + renderLine(line+1)
	].join('\n')
};

module.exports = (error, title='')=>{
	const err = parseError(error);
	const name = (title ? `${title} ` : error.test.name);
	const location = chalk.grey(`${err.file}:${err.line}`);
	const getReport = ()=>{
		if(Assert.isForcedFail(error)) return indent(error.message, '    ');
		if(error instanceof Assert.AssertionError) return indent(`Difference: \n${codeDiff(error.actual, error.expected)}`, '    ');
		return indent(err.stack, '    '); //TODO: possibly color this?
	};
	return `${chalk.redBright('  X')} ${name}  ${location}\n
${err.file ? codeSnippet(err.file, err.line, err.column, '    ') : ''}\n
${getReport()}\n`;
};