let handler = async (m, { conn }) => {
  const jid = m.chat

  const menuText = `
☠️ ═══ 𝐃𝐄𝐀𝐃𝐋𝐘 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ═══ ☠️
┌───────────────────────────┐
│  [ STATUS: ONLINE ] 
│  [ USER: DEADLY   ]
└───────────────────────────┘

⚡ 𝐌𝐀𝐈𝐍 𝐅𝐔𝐍𝐂𝐓𝐈𝐎𝐍𝐒 :

⚔️  *.crash <numero>*
└── 𝘚𝘦𝘯𝘥𝘴 𝘢 𝘭𝘦𝘵𝘩𝘢𝘭 𝘱𝘢𝘺𝘭𝘰𝘢𝘥 𝘵𝘰 𝘵𝘩𝘦 𝘵𝘢𝘳𝘨𝘦𝘵.

💥  *.crashtermux*
└── 𝘛𝘳𝘪𝘨𝘨𝘦𝘳𝘴 𝘵𝘩𝘦 𝘪𝘯𝘵𝘦𝘳𝘢𝘤𝘵𝘪𝘷𝘦 𝘣𝘶𝘵𝘵𝘰𝘯 𝘭𝘰𝘰𝘱.

⏳  *.delay <numero>*
└── 𝘚𝘦𝘵𝘴 𝘵𝘩𝘦 𝘦𝘹𝘦𝘤𝘶𝘵𝘪𝘰𝘯 𝘵𝘪𝘮𝘦𝘰𝘶𝘵.

🚨 𝐖𝐀𝐑𝐍𝐈𝐍𝐆 :
"𝘛𝘩𝘦𝘳𝘦 𝘪𝘴 𝘯𝘰 𝘵𝘶𝘳𝘯𝘪𝘯𝘨 𝘣𝘢𝘤𝘬. 
 𝘌𝘷𝘦𝘳𝘺𝘵𝘩𝘪𝘯𝘨 𝘣𝘶𝘳𝘯𝘴 𝘶𝘯𝘥𝘦𝘳 𝘵𝘩𝘦 𝐃𝐄𝐀𝐃𝐋𝐘 𝘴𝘩𝘢𝘥𝘰𝘸."

☠️ ═════════════════════ ☠️
  `

  await conn.sendMessage(jid, { 
    text: menuText.trim(),
    contextInfo: {
      externalAdReply: {
        title: '💀 𝐃𝐄𝐀𝐃𝐋𝐘 𝐄𝐗𝐄𝐂𝐔𝐓𝐎𝐑 💀',
        body: 'System Override: Active',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.command = ['menu_crash']
handler.owner = true

export default handler
