const {
	getRepoList
} = require('./http.js')
const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path');
const chalk = require('chalk');
const simpleGit = require('simple-git/promise');

function printInfo(message) {
	console.log(`${chalk.blue('ℹ')} ${message}`)
}

function printSuccess(message) {
	console.log(`${chalk.green('✔')} ${message}`)
}

function printError(message) {
	console.error(`${chalk.red('✖')} ${message}`)
}

function startDownloadProgress() {
	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
	let index = 0
	const timer = setInterval(() => {
		const frame = frames[index % frames.length]
		process.stdout.write(`\r${chalk.cyan(frame)} 下载中，请稍候...`)
		index += 1
	}, 120)

	return () => {
		clearInterval(timer)
		process.stdout.write('\r\x1b[K')
	}
}

async function getRepos() {
	const repoList = await getRepoList()
	const repos = repoList.map(item => ({
		path: item.path,
		description: item.description || '',
		value: item.path
	}))

	const { keyword } = await inquirer.prompt([{
		name: 'keyword',
		type: 'input',
		message: chalk.bold.cyan('请输入模板关键字（回车查看全部模板）'),
		default: ''
	}])

	const text = (keyword || '').trim().toLowerCase()
	const filteredRepos = text
		? repos.filter(item => item.path.toLowerCase().includes(text) || item.description.toLowerCase().includes(text))
		: repos

	if (!filteredRepos.length) {
		throw new Error('未找到匹配模板，请重新输入关键字')
	}

	console.log('')
	console.log(chalk.bold.cyan('可选模板：'))
	filteredRepos.forEach((item, index) => {
		console.log(`  ${index + 1}. ${item.path}${item.description ? chalk.dim(` — ${item.description}`) : ''}`)
	})
	console.log('')

	const { index } = await inquirer.prompt([{
		name: 'index',
		type: 'input',
		message: chalk.bold.cyan('请输入模板编号进行选择'),
		default: '1',
		validate: input => {
			const number = Number(input)
			if (!Number.isInteger(number) || number < 1 || number > filteredRepos.length) {
				return `请输入 1-${filteredRepos.length} 之间的编号`
			}
			return true
		}
	}])

	return filteredRepos[Number(index) - 1].value
}

async function resolveTargetPath(name, options) {
	const cwd = process.cwd();
	const targetPath = path.join(cwd, name)
	if (!fs.existsSync(targetPath)) {
		return { cwd, targetPath, resolvedName: name }
	}

	if (options.force) {
		fs.rmSync(targetPath, { recursive: true, force: true })
		printInfo(`已使用 --force 覆盖已有目录 ${chalk.cyan(targetPath)}`)
		return { cwd, targetPath, resolvedName: name }
	}

	const { action } = await inquirer.prompt([{
		name: 'action',
		type: 'list',
		choices: [
			{ name: '覆盖并继续', value: 'overwrite' },
			{ name: '更换项目名', value: 'rename' },
			{ name: '取消创建', value: 'cancel' }
		],
		message: chalk.yellow(`目录 ${chalk.cyan(name)} 已存在，请选择处理方式`)
	}])

	if (action === 'overwrite') {
		fs.rmSync(targetPath, { recursive: true, force: true })
		printInfo(`已覆盖已有目录 ${chalk.cyan(targetPath)}`)
		return { cwd, targetPath, resolvedName: name }
	}

	if (action === 'rename') {
		const { newName } = await inquirer.prompt([{
			name: 'newName',
			type: 'input',
			message: '请输入新的项目名称',
			default: `${name}-copy`
		}])
		return resolveTargetPath(newName, options)
	}

	throw new Error('已取消创建项目')
}

async function cloneTemplate(repo, targetPath, targetName) {
	const requestUrl = `https://gitee.com/rawcloud/${repo}.git`
	const finishProgress = startDownloadProgress()

	try {
		const git = simpleGit(process.cwd())
		await git.clone(requestUrl, targetName)
		finishProgress()
		printSuccess(`模板下载完成：${chalk.cyan(targetName)}`)
	} catch (error) {
		finishProgress()
		printError(`下载模板失败：${error.message || '未知错误'}`)

		const { retry } = await inquirer.prompt([{
			name: 'retry',
			type: 'confirm',
			message: '是否重试下载？',
			default: true
		}])

		if (retry) {
			return cloneTemplate(repo, targetPath, targetName)
		}

		throw new Error(`模板下载失败：${error.message || '未知错误'}`)
	}
}

async function onDownload(name, repo, options) {
	const { cwd, targetPath, resolvedName } = await resolveTargetPath(name, options)
	printInfo(`正在拉取模板 ${chalk.cyan(repo)} 到 ${chalk.cyan(targetPath)}...`)
	await cloneTemplate(repo, targetPath, resolvedName)
}

module.exports = async function(name, options = {}) {
	try {
		console.log('')
		printInfo(`开始创建项目 ${chalk.cyan(name)}`)
		const repo = await getRepos()
		await onDownload(name, repo, options)

		console.log('')
		printSuccess(`成功创建项目 ${chalk.cyan(name)}`)
		console.log(`  ${chalk.cyan('cd')} ${chalk.cyan(name)}`)
		console.log(`  ${chalk.cyan('npm run serve')}`)
		console.log('')
	} catch (error) {
		printError(`${error.message || '未知错误'}`)
		process.exit(1)
	}
}
