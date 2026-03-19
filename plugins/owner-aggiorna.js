import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  try {
    await conn.reply(m.chat, '*🔄 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐨 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐢...*', m)

    const update = execSync('git fetch origin && git reset --hard origin/main && git pull', {
      encoding: 'utf-8'
    })

    const updatedFiles = update
      .split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const [file, changes] = line.split('|').map(s => s.trim())
        const ins = (changes.match(/\+/g) || []).length
        const del = (changes.match(/-/g) || []).length
        return `📄 ${file} (+${ins}/-${del})`
      })

    let resultMsg = '*✅ 𝐀𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐭𝐨!*'

    if (updatedFiles.length > 0) {
      resultMsg += `\n\n📦 *𝐅𝐢𝐥𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐢:* ${updatedFiles.length}\n\n${updatedFiles.join('\n')}`
    } else {
      resultMsg += '\n\nℹ️ *𝐍𝐞𝐬𝐬𝐮𝐧 𝐟𝐢𝐥𝐞 𝐝𝐚 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐫𝐞*'
    }

    await conn.reply(m.chat, resultMsg, m)
    await m.react('✅')

  } catch (err) {
    await conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐦𝐞𝐧𝐭𝐨:*\n\n${err.message}`,
      m
    )
    await m.react('❌')
  }
}

handler.help = ['aggiorna']
handler.tags = ['owner']
handler.command = /^(aggiorna|update|aggiornabot)$/i
handler.owner = true

export default handler
