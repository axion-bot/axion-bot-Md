import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

const CARTELLE_ESCLUSE = new Set(['node_modules', '.git', 'tmp', 'session', 'sessions', 'cache'])
const CARTELLE_SCANSIONATE = [
  'plugins',
  'lib',
  'media',
  'database',
  'web'
]
const FILE_MOSTRATI = ['config.js', 'handler.js', 'main.js']
const CHECK_FILE = path.resolve('./tmp/check-report.json')

function readFilesRecursive(baseDir, folders, exclude) {
    let files = []
    for (const folder of folders) {
        const fullPath = folder === '.' ? baseDir : path.join(baseDir, folder)
        if (!fs.existsSync(fullPath)) continue
        const walk = dir => {
            if (exclude.has(path.basename(dir))) return
            const entries = fs.readdirSync(dir, { withFileTypes: true })
            for (const entry of entries) {
                const p = path.join(dir, entry.name)
                if (entry.isDirectory()) {
                    if (!exclude.has(entry.name)) walk(p)
                } else if (entry.isFile()) {
                    if (!entry.name.startsWith('.')) files.push(p.replace(baseDir + '/', ''))
                }
            }
        }
        walk(fullPath)
    }
    return files
}

function sample(arr, n) {
    const copy = [...arr]
    let result = []
    while(result.length < n && copy.length > 0) {
        const idx = Math.floor(Math.random() * copy.length)
        result.push(copy.splice(idx,1)[0])
    }
    return result
}

function progressBar(percent) {
    const totalBlocks = 10
    const filledBlocks = Math.floor(percent / 10)
    const emptyBlocks = totalBlocks - filledBlocks
    return `*[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}]* ${percent}%`
}

async function editMessage(conn,chatId,key,text){
  await conn.relayMessage(
    chatId,
    {
      protocolMessage:{
        key,
        type:14,
        editedMessage:{
          extendedTextMessage:{text}
        }
      }
    },
    {}
  )
}

let handler = async (
  m,
  {
    conn,
    command,
    args
  }
) => {
    if(command === 'check') {
        const botBaseFolder = process.cwd()

        let allFiles = readFilesRecursive(botBaseFolder, CARTELLE_SCANSIONATE, CARTELLE_ESCLUSE)

        const filteredFilesForSample = allFiles.filter(f => !FILE_MOSTRATI.includes(path.basename(f)))

        let randomSampleFiles = sample(filteredFilesForSample, 22)

        const scanFileList = [...FILE_MOSTRATI, ...randomSampleFiles]

        let totalEdits = scanFileList.length,
    maxProgressPercent = 100,
    progressStepPercent = maxProgressPercent / totalEdits

        const progressMsg = await conn.sendMessage(
            m.chat,
            { text: `${progressBar(0)}\n\n*🔎 𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*\n\n*${scanFileList[0]}*` },
            { quoted: m }
        )

        let progressPercentCurrent = 0

for(let i=1; i<=totalEdits; i++) {
    await new Promise(resolve => setTimeout(resolve, 220 + Math.random()*30))

    progressPercentCurrent += progressStepPercent

    let roundedProgressPercentsDisplay= Math.min(100, Math.floor(progressPercentCurrent/10)*10)

    const text =
`${progressBar(roundedProgressPercentsDisplay)}

*🔎 𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*

*${scanFileList[Math.min(i - 1, totalEdits - 1)]}*`

    await editMessage(
      conn,
      m.chat,
      progressMsg.key,
      text
    )
}

const finalScanText =
`██████████

*✅ 𝐀𝐧𝐚𝐥𝐢𝐬𝐢 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐚*

*📋 𝐄𝐥𝐚𝐛𝐨𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐢...*`

await editMessage(
  conn,
  m.chat,
  progressMsg.key,
  finalScanText
)

await new Promise(resolve => setTimeout(resolve, 500))

const FILE_CRITICI=['config.js','handler.js','main.js']

const fileCriticiMancanti=FILE_CRITICI.filter(
  file=>!fs.existsSync(path.join(botBaseFolder,file))
)

const jsonErrors=[]
const pluginErrors=[]

for(const file of allFiles){

  const fullPath=path.join(botBaseFolder,file)

  if(file.endsWith('.json')){
    try{
      JSON.parse(fs.readFileSync(fullPath,'utf8'))
    }catch{
      jsonErrors.push(file)
    }
  }

  if(file.endsWith('.js')){
    const result=spawnSync(
      process.execPath,
      ['--check',fullPath],
      {encoding:'utf8'}
    )

    if(result.status!==0){
      pluginErrors.push({
        file,
        error:(result.stderr||'Errore sintassi')
          .split('\n')[0]
      })
    }
  }
}

const everythingOk=
  !fileCriticiMancanti.length &&
  !jsonErrors.length &&
  !pluginErrors.length

fs.mkdirSync(
  path.dirname(CHECK_FILE),
  {recursive:true}
)

fs.writeFileSync(
  CHECK_FILE,
  JSON.stringify({
    createdAt:Date.now(),
    fileCriticiMancanti,
    jsonErrors,
    pluginErrors,
    totalFiles:allFiles.length,
    totalPlugins:allFiles.filter(v=>v.endsWith('.js')).length,
    totalJson:allFiles.filter(v=>v.endsWith('.json')).length
  },null,2)
)

          if(everythingOk){
              await conn.sendMessage(m.chat,
                  {
                      text:
`*✅ 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐜𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐢 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐬𝐮𝐩𝐞𝐫𝐚𝐭𝐢 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚𝐦𝐞𝐧𝐭𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
                  },
                  { quoted:m }
              )
          } else{
              await conn.sendMessage(m.chat,
                  {
                      text:
`*⚠️* 
*𝐀𝐥𝐜𝐮𝐧𝐢 𝐞𝐥𝐞𝐦𝐞𝐧𝐭𝐢 𝐫𝐢𝐜𝐡𝐢𝐞𝐝𝐨𝐧𝐨 𝐮𝐥𝐭𝐞𝐫𝐢𝐨𝐫𝐢 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐡𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
                      buttons:[
  {buttonId:'.checkfull', buttonText:{displayText:'📊 Diagnostica'}, type:1}
],
headerType:1
                    
                  },
                  { quoted:m }
              )
          }

      } else if(command === 'checkfull') {
      if(!fs.existsSync(CHECK_FILE)){
  return m.reply(
    '*⚠️ 𝐄𝐬𝐞𝐠𝐮𝐢 𝐩𝐫𝐢𝐦𝐚 .𝐜𝐡𝐞𝐜𝐤*'
  )
}

const report=JSON.parse(
  fs.readFileSync(CHECK_FILE,'utf8')
)

let text=
`*📊 𝐃𝐈𝐀𝐆𝐍𝐎𝐒𝐓𝐈𝐂𝐀*

*${report.fileCriticiMancanti.length?'⚠️':'✅'} 𝐅𝐢𝐥𝐞 𝐜𝐫𝐢𝐭𝐢𝐜𝐢: ${report.fileCriticiMancanti.length||'OK'}*
*${report.jsonErrors.length?'⚠️':'✅'} 𝐉𝐒𝐎𝐍: ${report.jsonErrors.length||'OK'}*
*${report.pluginErrors.length?'⚠️':'✅'} 𝐏𝐥𝐮𝐠𝐢𝐧: ${report.pluginErrors.length||'OK'}*

*📂 𝐏𝐥𝐮𝐠𝐢𝐧: ${report.totalPlugins}*
*📄 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞: ${report.totalJson}*
*📈 𝐅𝐢𝐥𝐞 𝐚𝐧𝐚𝐥𝐢𝐳𝐳𝐚𝐭𝐢: ${report.totalFiles}*`

if(report.fileCriticiMancanti.length){
  text+=`\n\n*🚨 𝐅𝐢𝐥𝐞 𝐜𝐫𝐢𝐭𝐢𝐜𝐢 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐢*\n${report.fileCriticiMancanti.join('\n')}`
}

if(report.jsonErrors.length){
  text+=`\n\n*⚠️ 𝐉𝐒𝐎𝐍 𝐜𝐨𝐫𝐫𝐨𝐭𝐭𝐢*\n${report.jsonErrors.join('\n')}`
}

if(report.pluginErrors.length){
  text+=`\n\n*❌ 𝐏𝐥𝐮𝐠𝐢𝐧 𝐜𝐨𝐧 𝐞𝐫𝐫𝐨𝐫𝐢*\n${report.pluginErrors.map(v=>v.file).join('\n')}`
}

text+=`\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

await conn.sendMessage(
  m.chat,
  { text },
  { quoted:m }
)
      } else return
}

handler.help=['check','checkfull']
handler.tags=['owner']
handler.command=/^(check|checkfull)$/i
handler.owner=true

export default handler
