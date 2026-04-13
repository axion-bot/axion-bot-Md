//by Bonzino

import axios from 'axios'

const API_KEY = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDc2NTUzMjEsImlhdCI6MTc3NjExOTMyMSwicmF5IjoiNWQ1NDNjNmM1YjEyN2JjZmIwMmFhZTg3MGI5NTU2N2EiLCJzdWIiOjM5NjkyOTN9.X-U7NQevggA1ZT5iRtENf7b0Oxbl7ftlVC60jMDlhzES6N5XrRZAo20_VwO8_Or4n6A1613HcsvzDXcGQPpFE4i4K3XHg3Q9o0pbOUqef6GQ2QTaN-u9L3zT8YvowG2JttaCbwNBhSyKjWkCk3s-wLf_CiVoKtl-ePh0QtZh3SADSWuA64SR08r8daj8Yek5jAk6W3KSnxku5BgJ2Pl4VETCnEqA0jiVMcI9YK1cmtqKMaZVl7zlacVkUOq8rDz70YmgtgohaUk6iRJMBqJDW-9h-W5Xj-ZCeAQxCDs9Mq6tBU8pPX5T8cLDAsYJib5vm34wsgPNwfTItoOYORtujQ'

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: 'application/json'
}

let handler = async (m) => {
  try {
    if (API_KEY === 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDc2NTUzMjEsImlhdCI6MTc3NjExOTMyMSwicmF5IjoiNWQ1NDNjNmM1YjEyN2JjZmIwMmFhZTg3MGI5NTU2N2EiLCJzdWIiOjM5NjkyOTN9.X-U7NQevggA1ZT5iRtENf7b0Oxbl7ftlVC60jMDlhzES6N5XrRZAo20_VwO8_Or4n6A1613HcsvzDXcGQPpFE4i4K3XHg3Q9o0pbOUqef6GQ2QTaN-u9L3zT8YvowG2JttaCbwNBhSyKjWkCk3s-wLf_CiVoKtl-ePh0QtZh3SADSWuA64SR08r8daj8Yek5jAk6W3KSnxku5BgJ2Pl4VETCnEqA0jiVMcI9YK1cmtqKMaZVl7zlacVkUOq8rDz70YmgtgohaUk6iRJMBqJDW-9h-W5Xj-ZCeAQxCDs9Mq6tBU8pPX5T8cLDAsYJib5vm34wsgPNwfTItoOYORtujQ') {
      return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* API key mancante.')
    }

    const { data } = await axios.get(
      'https://5sim.net/v1/user/profile',
      { headers, timeout: 15000 }
    )

    let txt = `*✅ 𝐒𝐀𝐋𝐃𝐎*\n\n`
    txt += `💰 *Balance:* \`$${Number(data.balance || 0).toFixed(2)}\`\n`
    txt += `🧊 *Frozen:* \`$${Number(data.frozen_balance || 0).toFixed(2)}\`\n`
    txt += `⭐ *Rating:* \`${data.rating ?? 'N/D'}\``

    return m.reply(txt)

  } catch (e) {
    console.error('Errore saldo:', e?.response?.data || e)
    return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile ottenere il saldo.')
  }
}

handler.command = ['saldo']
handler.tags = ['strumenti']
handler.help = ['saldo']

export default handler