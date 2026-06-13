//plugin "rpg-prelievo" by Bonzino

global.db.data.prelievoSessioni ??= {}

const footer='𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
fmt=n=>new Intl.NumberFormat('it-IT').format(n||0),
qid=m=>m.quoted?.id||m.quoted?.key?.id||m.message?.extendedTextMessage?.contextInfo?.stanzaId,
user=id=>{
  const u=global.db.data.users[id]??={}
  u.euro??=0
  u.bank??=0
  return u
},
box=(emoji,title,body,showFooter=true)=>`${emoji} *${title}*

${body}${showFooter?`

> *${footer}*`:''}`;

let handler=async(m,{conn,args,command})=>{

  const cmd=(command||'').toLowerCase()
  if(cmd=='confermaprelievo')return confermaPrelievo(m)
  if(cmd=='annullaprelievo')return annullaPrelievo(m)

  user(m.sender)

  if(args[0])return preparaPrelievo(m,conn,args.join(' '))

  const sent=await conn.sendMessage(m.chat,{
text:box('🏧','𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',`*💸 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥'𝐢𝐦𝐩𝐨𝐫𝐭𝐨 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢:* all • metà • 50% • 100`)
  },{quoted:m})

  global.db.data.prelievoSessioni[`${m.chat}|${sent.key.id}`]={
    owner:m.sender,
    createdAt:Date.now()
  }
}

handler.before=async function(m,{conn}){
  if(!m.text)return false

  const id=qid(m)
  if(!id)return false

  const key=`${m.chat}|${id}`,
  s=global.db.data.prelievoSessioni[key]

  if(!s)return false

  if(s.owner!==m.sender){
    await m.reply(box('🚫','𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐓𝐔𝐀','*❌ 𝐐𝐮𝐞𝐬𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐚𝐩𝐩𝐚𝐫𝐭𝐢𝐞𝐧𝐞 𝐚 𝐭𝐞.*'))
    return true
  }

  if(Date.now()-s.createdAt>60000){
    delete global.db.data.prelievoSessioni[key]
    await m.reply(box('⏳','𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐀',`*⌛ 𝐋𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐝𝐢 𝐩𝐫𝐞𝐥𝐢𝐞𝐯𝐨 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*

*📌 𝐑𝐢𝐚𝐩𝐫𝐢 𝐢𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐞 𝐫𝐢𝐩𝐫𝐨𝐯𝐚.*`))
    return true
  }

  delete global.db.data.prelievoSessioni[key]
  await preparaPrelievo(m,conn,m.text.trim())
  return true
}

handler.command=/^(preleva|prelievo|confermaprelievo|annullaprelievo)$/i
handler.help=['preleva']
handler.tags=['economia']
export default handler

async function preparaPrelievo(m,conn,input){
  const u=user(m.sender),
  a=parseAmount(input,u.bank)

  if(!a.valid)
    return m.reply(box('❌','𝐐𝐔𝐀𝐍𝐓𝐈𝐓À 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐀',a.message))

  if(a.value>u.bank)
    return m.reply(box('❌','𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',`*🏦 𝐇𝐚𝐢 𝐬𝐨𝐥𝐨 ${fmt(u.bank)}€ 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚.*`))

  u._prelievoPending={amount:a.value,createdAt:Date.now()}

  await conn.sendMessage(m.chat,{
    text:box('🏧','𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',`*💸 𝐐𝐮𝐚𝐧𝐭𝐢𝐭à:* ${fmt(a.value)}€

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${fmt(u.euro+a.value)}€
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${fmt(u.bank-a.value)}€
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${fmt(u.euro+u.bank)}€

*📌 𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐢 𝐥’𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞?*`,false),
    footer,
    buttons:[
      {buttonId:'.confermaprelievo',buttonText:{displayText:'✅ Conferma'},type:1},
      {buttonId:'.annullaprelievo',buttonText:{displayText:'❌ Annulla'},type:1}
    ],
    headerType:1
  },{quoted:m})
}

async function confermaPrelievo(m){
  const u=user(m.sender),p=u._prelievoPending

  if(!p)
    return m.reply(box('❌','𝐍𝐄𝐒𝐒𝐔𝐍 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎','*📌 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐩𝐫𝐞𝐥𝐢𝐞𝐯𝐢 𝐢𝐧 𝐚𝐭𝐭𝐞𝐬𝐚.*'))

  if(Date.now()-p.createdAt>60000){
    delete u._prelievoPending
    return m.reply(box('⏳','𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎','*⌛ 𝐋𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*'))
  }

  if(p.amount>u.bank){
    delete u._prelievoPending
    return m.reply(box('❌','𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄','*🏦 𝐈 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢ù 𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐢.*'))
  }

  u.bank-=p.amount
  u.euro+=p.amount
  delete u._prelievoPending

  return m.reply(box('✅','𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐎',`*💸 𝐏𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐢:* ${fmt(p.amount)}€

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${fmt(u.euro)}€
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${fmt(u.bank)}€
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${fmt(u.euro+u.bank)}€`))
}

async function annullaPrelievo(m){
  delete user(m.sender)._prelievoPending
  return m.reply(box('❌','𝐎𝐏𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐀','*📌 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 è 𝐬𝐭𝐚𝐭𝐚 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐚.*'))
}

function parseAmount(i,max){
  const v=String(i||'').toLowerCase().trim().replace(/\s+|\./g,'')

  if(['all','tutto'].includes(v))
    return max>0
      ?{valid:true,value:max}
      :{valid:false,message:'*🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐬𝐨𝐥𝐝𝐢 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞.*'}

  if(['meta','metà','50%'].includes(v)){
    const n=Math.floor(max/2)
    return n>0
      ?{valid:true,value:n}
      :{valid:false,message:'*🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚.*'}
  }

  if(!/^\d+$/.test(v))
    return{valid:false,message:'*🔢 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*'}

  const n=parseInt(v)

  return n<=0
    ?{valid:false,message:'*💸 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐦𝐢𝐧𝐢𝐦𝐚 è 𝟏.*'}
    :{valid:true,value:n}
}