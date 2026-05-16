// groupwarn by Bonzino

global.cleanWarnJid=function(jid=''){
  return String(jid||'').split(':')[0].trim().toLowerCase()
}

global.cleanWarnNumber=function(jid=''){
  return String(jid||'').split('@')[0].split(':')[0].replace(/[^0-9]/g,'')
}

global.findWarnUserKey=function(jid=''){
  global.db.data.users??={}
  const users=global.db.data.users
  const num=global.cleanWarnNumber(jid)
  return Object.keys(users).find(key=>global.cleanWarnNumber(key)===num)||global.cleanWarnJid(jid)
}

global.getGroupWarnData=function(userJid,chatId){
  global.db.data.users??={}
  const users=global.db.data.users
  const realKey=global.findWarnUserKey(userJid)
  const chat=String(chatId||'')
  users[realKey]??={}
  const user=users[realKey]
  user.groupWarns??={}
  user.groupWarns[chat]??={warn:0,warnReasons:[],lastWarnReason:'',lastWarnBy:'',lastWarnAt:0}
  const data=user.groupWarns[chat]
  if(typeof data.warn!=='number')data.warn=Number(data.warn||0)
  if(!Array.isArray(data.warnReasons))data.warnReasons=[]
  return data
}

global.addGroupWarn=function(userJid,chatId,reason='',by='system'){
  const data=global.getGroupWarnData(userJid,chatId)
  data.warn=Number(data.warn||0)+1
  if(reason){
    data.warnReasons.push(reason)
    data.lastWarnReason=reason
  }
  data.lastWarnBy=by
  data.lastWarnAt=Date.now()
  return data
}

global.removeGroupWarn=function(userJid,chatId){
  const data=global.getGroupWarnData(userJid,chatId)
  data.warn=Math.max(Number(data.warn||0)-1,0)
  return data
}

global.resetGroupWarn=function(userJid,chatId){
  const data=global.getGroupWarnData(userJid,chatId)
  data.warn=0
  data.warnReasons=[]
  data.lastWarnReason=''
  data.lastWarnBy=''
  data.lastWarnAt=0
  return data
}

global.getGroupWarn=function(userJid,chatId){
  return Number(global.getGroupWarnData(userJid,chatId).warn||0)
}