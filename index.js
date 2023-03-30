#! /usr/bin/env node
const fs = require("fs");
const path = require("path");
const argv = require("minimist")(process.argv.slice(2));

function create() {
  const { dir, module, scss, _: componentNames } = argv;

  if (!dir || componentNames.length < 1) {
    console.error(
      "You must specify dirname (--dir) and at least one component name."
    );
    process.exit(1);
  }

  const distDir = path.join(process.cwd(), dir);

  if (!fs.existsSync(distDir)) {
    try {
      fs.mkdirSync(distDir, { recursive: true });
    } catch (error) {
      console.error(
        `Error occurred while creating destination directory: ${error}`
      );
      process.exit(1);
    }
  }

  componentNames.forEach((name) => {
    const componentDir = `${distDir}/${name}`;
    try {
      createComponent(componentDir, name, { module, scss });
    } catch (error) {
      console.error(
        `Error occurred while creating ${componentDir}:\n ${error}`
      );
      process.exit(1);
    }
  });
}

function createComponent(path, name, options) {
  const { module, scss } = options;
  const tsxFileName = `${name}.tsx`;
  const tsxFilePath = `${path}/${tsxFileName}`;
  const stylesFileName = `${name}.${module ? "module." : ""}${
    scss ? "scss" : "css"
  }`;
  const stylesFilePath = `${path}/${stylesFileName}`;
  const indexFilePath = `${path}/index.ts`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }

  if (!fs.existsSync(tsxFilePath)) {
    fs.openSync(tsxFilePath, "w", 0o666);
  }

  fs.writeFileSync(tsxFilePath, tsxContent(name, stylesFileName));
  fs.writeFileSync(indexFilePath, indexContent(name));
  fs.writeFileSync(stylesFilePath, "");
}

function tsxContent(name, stylesFileName) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const propsName = `${capitalizedName}Props`;
  return `import { FC } from "react";
import styles from "./${stylesFileName}"

type ${propsName} = {} 
  
export const ${capitalizedName}: FC<${propsName}> = () => {
  return <></>
}
    `;
}

function indexContent(name) {
  return `export * from "./${name}"
  `;
}

create();
