/* plugin per controllare i consumi del modello openAI
by Bonzino*/

let handler = async (m, { usedPrefix }) => {
  const stats = global.db.data.aiCost || {
    totalInput: 0,
    totalOutput: 0,
    totalCost: 0,
    requests: 0,
    openai: 0,
    fallback: 0,
    today: {}
  }

  const oggi = new Date().toISOString().slice(0, 10)

  const today = stats.today?.[oggi] || {
    input: 0,
    output: 0,
    cost: 0,
    requests: 0
  }

  const msg =
`*╭━━━━━━━💸━━━━━━━╮*
*✦ 𝐂𝐎𝐒𝐓𝐈 𝐈𝐀 ✦*
*╰━━━━━━━💸━━━━━━━╯*

*📅 𝐎𝐠𝐠𝐢*
*➜ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞:* *${today.requests || 0}*
*➜ 𝐈𝐧𝐩𝐮𝐭 𝐭𝐨𝐤𝐞𝐧:* *${formatNumber(today.input || 0)}*
*➜ 𝐎𝐮𝐭𝐩𝐮𝐭 𝐭𝐨𝐤𝐞𝐧:* *${formatNumber(today.output || 0)}*
*➜ 𝐂𝐨𝐬𝐭𝐨:* *$${formatMoney(today.cost || 0)}*

*📊 𝐓𝐨𝐭𝐚𝐥𝐞*
*➜ 𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞:* *${stats.requests || 0}*
*➜ 𝐎𝐩𝐞𝐧𝐀𝐈:* *${stats.openai || 0}*
*➜ 𝐅𝐚𝐥𝐥𝐛𝐚𝐜𝐤:* *${stats.fallback || 0}*
*➜ 𝐈𝐧𝐩𝐮𝐭 𝐭𝐨𝐤𝐞𝐧:* *${formatNumber(stats.totalInput || 0)}*
*➜ 𝐎𝐮𝐭𝐩𝐮𝐭 𝐭𝐨𝐤𝐞𝐧:* *${formatNumber(stats.totalOutput || 0)}*
*➜ 𝐂𝐨𝐬𝐭𝐨 𝐬𝐭𝐢𝐦𝐚𝐭𝐨:* *$${formatMoney(stats.totalCost || 0)}*

*📌 𝐏𝐫𝐞𝐳𝐳𝐢 𝐦𝐨𝐝𝐞𝐥𝐥𝐨*
*➜ 𝐈𝐧𝐩𝐮𝐭:* *$0.40 / 1M*
*➜ 𝐎𝐮𝐭𝐩𝐮𝐭:* *$1.60 / 1M*

*🔄 𝐑𝐞𝐬𝐞𝐭:* *${usedPrefix}resetcostiai*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  return m.reply(msg)
}

handler.help = ['costiai']
handler.tags = ['owner']
handler.command = /^(costiai|costiia|aicost|costiopenai|consumo|consumoia)$/i
handler.owner = true

export default handler

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT')
    .format(Number(num) || 0)
}

function formatMoney(num) {
  return Number(num || 0)
    .toFixed(6)
}
