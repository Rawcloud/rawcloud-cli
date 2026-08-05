# RawCloud CLI

> Language Switch / 语言切换
>
> [English](README.en.md) · [中文](README.zh.md)

A lightweight project scaffolding CLI for creating projects from template repositories.

## Features

- Creates a new project directory from a selected template
- Supports interactive template selection in the terminal
- Includes clear terminal hints for create, download, and retry flows
- Provides a simple command entry point for local use

## Preview

![Project creation preview](img/1.png)

![Template selection preview](img/2.png)

![Terminal interaction preview](img/3.png)

## Installation

```bash
npm install
npm link
```

## Usage

```bash
rawcloud-cli create <appname>
```

### Example

```bash
rawcloud-cli create my-app
```

## Development

```bash
node cli.js create my-app
```

## Project Structure

```text
rawcloud-cli/
├── cli.js
├── package.json
├── README.md
├── README.en.md
├── README.zh.md
└── lib/
    ├── create.js
    └── http.js
```

## FAQ

**Q: Why does the command prompt me to select a template?**

A: The CLI loads template repositories from the RawCloud Gitee organization and lets you pick one interactively.

**Q: What should I do if the download fails?**

A: The CLI will ask whether you want to retry. You can also use the `--force` option when the target directory already exists.

**Q: How do I test it locally?**

A: Run `node cli.js create my-app` in the project root.

## Language Switch

- [English](README.en.md)
- [中文](README.zh.md)
