'use strict'

const fs = require('fs')
const {sum, map, filter, forEach, flow} = require('lodash/fp')
const srcPath = '/src/main/';
const threshold = 10;

const packagesDirPath = '../santa-editor/packages/'

const isSrcFile = fileName => fileName.indexOf('.js') > -1 && fileName.indexOf('rt.js') < 0

const processFile = filePath => {
    if (fs.lstatSync(filePath).isDirectory()) {
        var dirFiles = fs.readdirSync(filePath);
        var dirFilesPaths = map(dirFileName => `${filePath}/${dirFileName}`)(dirFiles);
        return flow(
            map(processFile),
            sum()
        )
        (dirFilesPaths)
    } else {
        return isSrcFile(filePath) ? 1 : 0;
    }
}

const counters  = flow(
    filter(packageName => fs.lstatSync(packagesDirPath + packageName).isDirectory()),
    map(packageName => {
        const packageSrcPath = packagesDirPath + packageName + srcPath;
        const packageFiles = fs.readdirSync(packageSrcPath);


        const filesCounter = flow(
            map(processFile),
            sum()
        )(packageFiles)


        if (filesCounter > threshold) {
            return {packageName, filesCounter}
            // console.log(`name: ${packageName}`)
            // console.log(`files counter: ${filesCounter}`)
        }
        return null;
    })
)(fs.readdirSync(packagesDirPath))






