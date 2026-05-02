import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Inserisci l\'username di Instagram. Esempio: .idig leomessi')

    const user = text.replace(/@/g, '').trim()

    try {
        await m.react('🔍')

        const res = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${user}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'X-IG-App-ID': '936619743392459',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        })
        
        const json = await res.json()
        
        if (!json.data || !json.data.user) {
            return m.reply('❌ Account non trovato. Assicurati che l\'username sia corretto.')
        }

        const data = json.data.user

        let info = `───『 **IG LOOKUP & INFO** 』───\n\n`
        info += `👤 **Username:** @${data.username}\n`
        info += `🆔 **ID Numerico:** ${data.id}\n`
        info += `📝 **Nome:** ${data.full_name || 'N/D'}\n`
        info += `📖 **Bio:** ${data.biography || 'Nessuna'}\n\n`
        
        info += `📊 **STATISTICHE**\n`
        info += `👥 **Followers:** ${data.edge_followed_by.count.toLocaleString()}\n`
        info += `📉 **Following:** ${data.edge_follow.count.toLocaleString()}\n`
        info += `📸 **Post:** ${data.edge_owner_to_timeline_media.count}\n\n`
        
        info += `📂 **DETTAGLI**\n`
        info += `🏢 **Categoria:** ${data.category_name || 'N/D'}\n`
        info += `🔒 **Privato:** ${data.is_private ? 'Sì' : 'No'}\n`
        info += `✅ **Verificato:** ${data.is_verified ? 'Sì' : 'No'}\n\n`

        info += `📧 **Email:** ${data.business_email || 'Non pubblica'}\n`
        info += `📞 **Telefono:** ${data.business_phone_number || 'Non pubblico'}\n`
        if (data.external_url) info += `🔗 **Link:** ${data.external_url}\n`
        
        info += `\n> Powered by 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`

        await conn.sendMessage(m.chat, { 
            image: { url: data.profile_pic_url_hd }, 
            caption: info 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply(`[ERROR]: Impossibile recuperare i dati.\n\n*Motivo:* Instagram ha limitato la richiesta o l'account è troppo protetto.`)
    }
}

handler.help = ['idig <username>']
handler.tags = ['tools', 'main']
handler.command = /^(idig|idinstagram|iginfo)$/i
handler.owner = true 

export default handler