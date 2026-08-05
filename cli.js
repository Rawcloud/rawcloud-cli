#! /usr/bin/env node

const program = require('commander')

program
	.name('rawcloud-cli')
	.description('RawCloud 项目脚手架工具')

program
	.command('create <appname>')
	.description('创建一个新的项目（支持从模板库中选择）')
	.option('-f, --force', '覆盖已存在目录中的同名项目')
	.action((name, options) => {
		require('./lib/create.js')(name, options)
	})

program.parse()