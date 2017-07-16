'use strict'

const fs = require('fs')
const _ = require('lodash')

const packageFiles = fs.readdirSync('./logs')
const timeRegex = /\[([^\]]*)\]/
const dateRegex = /\'([^\']*)\'/
const newLineSt = '*x*x*x'

const jasmineStr = 'node js/test/jasmine.js --group packages'
const unlistedStr = 'Running \\"karma:unlisted'
const debugToolsStr = 'Running \\"karma:debugtools'
const rEditorStr = 'Running \\"karma:reditor'
const varStr = 'Running \\"karma:var'

const karmaEndStr = '] karma:var-TC'

const
    startTime = `Started '`
const searchParams = [{
    id: 'start',
    grepStr: startTime,
    regex: dateRegex
}, {
    id: 'jasmine',
    grepStr: jasmineStr,
    regex: timeRegex
}, {
    id: 'unlisted',
    grepStr: unlistedStr,
    regex: timeRegex
}, {
    id: 'debugTools',
    grepStr: debugToolsStr,
    regex: timeRegex
}, {
    id: 'rEditor',
    grepStr: rEditorStr,
    regex: timeRegex
}, {
    id: 'var',
    grepStr: varStr,
    regex: timeRegex
}, {
    id: 'karmaEnd',
    grepStr: karmaEndStr,
    regex: timeRegex
}]

const genGrepSt = (fileName) => (text) => `grep -i "${text}" ./logs/${fileName}`
const runGrep = (grepCmd) => require('child_process').execSync(grepCmd)
let times = []

_.forEach(packageFiles, (logFile) => {
    const createSearchStr = genGrepSt(logFile)
    times = times.concat([_(searchParams)
        .map('grepStr')
        .map(createSearchStr)
        .map(runGrep)
        .map((x) => x.toString())
        .map((line, index) => searchParams[index].regex.exec(line)[1])
        .value()
    ])
})

const columnsIds = _.map(searchParams, 'id').join(',') + '\n'
const output = columnsIds + _(times)
    .sortBy((fileTimes) => new Date(fileTimes[0]))
    .map((fileValues) => fileValues.join(','))
    .join('\n')

fs.writeFileSync('./times.txt', output)
