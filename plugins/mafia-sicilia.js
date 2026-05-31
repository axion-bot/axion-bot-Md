// Plug-in creato da elixir
let handler = async (m, { conn, command, args, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!global.db.data.gangs) global.db.data.gangs = {}
    let gangs = global.db.data.gangs

    let userGangName = Object.keys(gangs).find(name => gangs[name].members.includes(m.sender))
    let g = userGangName ? gangs[userGangName] : null

    if (command === 'creafamigghia' || command === 'fondafamigghia') {
        if (userGangName) return m.reply(`🚫 Fai già parte dei *${userGangName}*!`)
        if (user.money < 1000000) return m.reply('💰 Servono *1.000.000 🪙* per fondare un impero.')
        
        let name = args.join(' ')
        if (!name) return m.reply(`✍️ Scegli il nome!\nEsempio: \`${usedPrefix + command} Corleone\``)
        if (gangs[name]) return m.reply('❌ Questo nome è già temuto in città.')

        user.money -= 1000000
        gangs[name] = {
            name: name,
            don: m.sender,
            sottocapo: null,
            members: [m.sender],
            fondo: 0,
            level: 1,
            lastAttack: 0
        }
        return m.reply(`🌹 *BACIAMO LE MANI, PADRINO*\n\nLa famiglia *${name}* ora domina queste strade.\nUsa \`.famigghia\` per gestire i tuoi picciotti.`)
    }

    if (command === 'famigghia' || command === 'gang') {
        if (!g) return m.reply(`🚫 Non appartieni a nessuna famiglia.\nUsa \`.creafamigghia <nome>\` per iniziare.`)
        
        let report = `🌹 *FAMIGLIA ${g.name.toUpperCase()}* 🌹\n`
        report += `━━━━━━━━━━━━━━━━━━━━\n\n`
        report += `👑 *Don:* @${g.don.split('@')[0]}\n`
        report += `🥈 *Sottocapo:* ${g.sottocapo ? '@' + g.sottocapo.split('@')[0] : '_Nessuno_'}\n`
        report += `👥 *Membri:* ${g.members.length}\n`
        report += `💰 *Cassa:* ${g.fondo.toLocaleString()} 🪙\n`
        report += `📈 *Livello:* ${g.level}\n\n`
        report += `━━━━━━━━━━━━━━━━━━━━\n`
        report += `📍 \`${usedPrefix}invita\` • \`${usedPrefix}pizzu\`\n`
        report += `📍 \`${usedPrefix}attacca\` • \`${usedPrefix}cacciao\``
        
        return conn.sendMessage(m.chat, { text: report, mentions: g.members }, { quoted: m })
    }

    if (command === 'invita') {
        if (!g) return m.reply('🚫 Non hai una famiglia.')
        if (m.sender !== g.don && m.sender !== g.sottocapo) return m.reply('🚷 Solo il *Don* o il *Sottocapo* possono arruolare.')
        
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
        if (!who) return m.reply('👤 Tagga qualcuno da arruolare.')
        if (Object.values(gangs).some(f => f.members.includes(who))) return m.reply('❌ È già impegnato con un\'altra famiglia.')

        g.members.push(who)
        return m.reply(`✅ @${who.split('@')[0]} è ora un uomo d'onore dei *${userGangName}*!`, null, { mentions: [who] })
    }

    if (command === 'pizzu') {
        if (!g) return m.reply('🚫 Non hai protezione.')
        let cooldown = 14400000 
        if (new Date() - (user.lastpizzu || 0) < cooldown) return m.reply('⏳ I negozianti hanno già pagato. Torna più tardi.')

        let guadagno = Math.floor(Math.random() * 3000) + 2000
        let tassafamigghia = Math.floor(guadagno * 0.2)
        let netto = guadagno - tassafamigghia

        user.money += netto
        g.fondo += tassafamigghia
        user.lastpizzu = new Date() * 1

        m.reply(`🇮🇹 *RISCOSSIONE PIZZO*\n━━━━━━━━━━━━━━━\n\n💰 Lordo: +${guadagno.toLocaleString()} 🪙\n🌹 Alla Cassa: -${tassafamigghia.toLocaleString()} 🪙\n💵 Guadagno: +${netto.toLocaleString()} 🪙`)
    }

    if (command === 'attacca' || command === 'guerra') {
        if (!g) return m.reply('🚫 Non puoi dichiarare guerra da solo.')
        if (m.sender !== g.don && m.sender !== g.sottocapo) return m.reply('🚷 Solo i capi possono ordinare un attacco.')

        let targetName = args.join(' ')
        if (!targetName) return m.reply(`⚔️ Usa: \`${usedPrefix + command} <nome_nemico>\``)
        
        let enemy = gangs[targetName]
        if (!enemy) return m.reply('❌ Famiglia nemica non trovata.')
        if (targetName === userGangName) return m.reply('❓ Vuoi sparare ai tuoi uomini?')

        let wait = 3600000 
        if (new Date() - (g.lastAttack || 0) < wait) return m.reply('⏳ I tuoi uomini stanno ricaricando. Torna tra un\'ora.')

        g.lastAttack = new Date() * 1
        if (Math.random() > 0.5) {
            let stolen = Math.floor(enemy.fondo * 0.2)
            enemy.fondo -= stolen
            g.fondo += stolen
            return conn.sendMessage(m.chat, { text: `🔥 *VITTORIA!* 🔥\nAssalto ai *${targetName}* riuscito.\n💰 Bottino: +${stolen.toLocaleString()} 🪙`, mentions: g.members.concat(enemy.members) })
        } else {
            let loss = Math.floor(g.fondo * 0.1)
            g.fondo -= loss
            return m.reply(`💀 *SCONFITTA!* 💀\nL'assalto è fallito.\n📉 Perdite cassa: -${loss.toLocaleString()} 🪙`)
        }
    }

    if (command === 'cacciao') {
        if (!g) return m.reply('🚫 Non hai potere.')
        if (m.sender !== g.don) return m.reply('🚷 Solo il *Don* può espellere i membri.')
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
        if (!who || who === g.don) return m.reply('👤 Tagga chi vuoi cacciare.')

        g.members = g.members.filter(m => m !== who)
        if (who === g.sottocapo) g.sottocapo = null
        return m.reply(`👞 @${who.split('@')[0]} è stato cacciato.`, null, { mentions: [who] })
    }
}

handler.help = ['famigghia', 'pizzu', 'attacca', 'invita']
handler.tags = ['economy']
handler.command = /^(creafamigghia|fondafamigghia|famigghia|invita|pizzu|gang|attacca|guerra|cacciao)$/i

export default handler
