// owner-db-backup by Bonzino
import fs from 'fs'
import path from 'path'

const BACKUP_DIR=path.resolve('./db-backup')
const BACKUP_INTERVAL_MINUTES=5
const BACKUP_INTERVAL_MS=BACKUP_INTERVAL_MINUTES*60*1000
const MAX_BACKUPS=20

global.autoDbBackupState=global.autoDbBackupState||{started:false,interval:null,conn:null}

function ensureBackupDir(){fs.mkdirSync(BACKUP_DIR,{recursive:true})}
function getTimestamp(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}-${String(d.getSeconds()).padStart(2,'0')}`}
function getIntervalLabel(){if(BACKUP_INTERVAL_MINUTES<60)return `${BACKUP_INTERVAL_MINUTES} minuti`;if(BACKUP_INTERVAL_MINUTES%60===0){const h=BACKUP_INTERVAL_MINUTES/60;return `${h} ora${h>1?'e':''}`}return `${BACKUP_INTERVAL_MINUTES} minuti`}
function getSettingsKey(conn){return conn?.user?.jid||global.conn?.user?.jid||'main'}
function isAutoEnabled(conn){const key=getSettingsKey(conn);global.db.data.settings[key]??={};return !!global.db.data.settings[key].autoDbBackup}

function cleanupOldBackups(){
ensureBackupDir()
const files=fs.readdirSync(BACKUP_DIR).filter(f=>f.endsWith('.json')).map(file=>({file,path:path.join(BACKUP_DIR,file),time:fs.statSync(path.join(BACKUP_DIR,file)).mtimeMs})).sort((a,b)=>b.time-a.time)
for(let i=MAX_BACKUPS;i<files.length;i++){try{fs.unlinkSync(files[i].path)}catch{}}
}

function createDatabaseBackup(){
ensureBackupDir()
const dbData=global.db?.data||{users:{},chats:{},settings:{}}
const fileName=`database_backup_${getTimestamp()}.json`
const filePath=path.join(BACKUP_DIR,fileName)
const tmpPath=`${filePath}.tmp`
fs.writeFileSync(tmpPath,JSON.stringify(dbData,null,2))
fs.renameSync(tmpPath,filePath)
cleanupOldBackups()
return{fileName,filePath}
}

async function runAutoBackup(conn){
try{
if(!isAutoEnabled(conn))return
const{fileName}=createDatabaseBackup()
console.log(`[*] Backup database creato: ${fileName}`)
}catch(e){console.error('autoDbBackup error:',e)}
}

function startAutoBackupLoop(conn){
const state=global.autoDbBackupState
state.conn=conn
if(state.interval)clearInterval(state.interval)
if(isAutoEnabled(conn))runAutoBackup(conn)
state.interval=setInterval(async()=>{await runAutoBackup(state.conn||conn)},BACKUP_INTERVAL_MS)
state.started=true
}

global.restartAutoDbBackupLoop=startAutoBackupLoop
global.createDatabaseBackup=createDatabaseBackup

let handler=async(m,{conn,command,usedPrefix})=>{
const intervalLabel=getIntervalLabel()

if(/^(backupdb|dbbackup)$/i.test(command)){
try{
const{fileName}=createDatabaseBackup()
return m.reply(`*✅ 𝐁𝐚𝐜𝐤𝐮𝐩 𝐝𝐞𝐥 𝐝𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐜𝐫𝐞𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*

*📁 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚:* *db-backup*
*🗂️ 𝐅𝐢𝐥𝐞:* *${fileName}*

*♻️ 𝐕𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐦𝐚𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐠𝐥𝐢 𝐮𝐥𝐭𝐢𝐦𝐢:* *${MAX_BACKUPS} 𝐛𝐚𝐜𝐤𝐮𝐩*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
}catch(e){
return m.reply(`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐛𝐚𝐜𝐤𝐮𝐩.*

*🧾 𝐌𝐨𝐭𝐢𝐯𝐨:* *${e.message}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
}
}

if(/^autodb$/i.test(command)){
const enabled=isAutoEnabled(conn)
return m.reply(`*🗂️ 𝐒𝐭𝐚𝐭𝐨 𝐀𝐮𝐭𝐨𝐁𝐚𝐜𝐤𝐮𝐩*

*⚙️ 𝐒𝐭𝐚𝐭𝐨:* *${enabled?'𝐀𝐭𝐭𝐢𝐯𝐨':'𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐨'}*
*⏱️ 𝐈𝐧𝐭𝐞𝐫𝐯𝐚𝐥𝐥𝐨:* *${intervalLabel}*
*📁 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚:* *db-backup*
*♻️ 𝐌𝐚𝐱 𝐛𝐚𝐜𝐤𝐮𝐩:* *${MAX_BACKUPS}*

*📌 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞:*
*${usedPrefix}1 autodb*
*${usedPrefix}0 autodb*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
}
}

handler.before=async function(m,{conn}){
const state=global.autoDbBackupState
if(state.started)return
startAutoBackupLoop(conn)
}

handler.help=['backupdb','dbbackup','autodb']
handler.tags=['owner']
handler.command=/^(backupdb|dbbackup|autodb)$/i
handler.owner=true
export default handler