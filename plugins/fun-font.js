const standard = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

const fonts = {
    1: { name: "Grassetto", map: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵" },
    2: { name: "Corsivo", map: "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵" },
    3: { name: "Monospazio", map: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚚𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿" },
    4: { name: "Bolle", map: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨" },
    5: { name: "Gotico", map: "𝔞𝔟𝔠𝔡℔𝔣𝔤𝔥𝔦𝔧𝔨𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ" },
    6: { name: "Sottolineato", map: "a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲" },
    7: { name: "Quadrati", map: "🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉" },
    8: { name: "Macchina Scrivere", map: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" },
    9: { name: "Piccolo Maiuscolo", map: "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ" },
    10: { name: "Barrato", map: "a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶" },
    11: { name: "Specchio", map: "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎzⱯᗺϽᗡƎℲƃHIᒋʞ˥WNOԀΌᴚS⊥∩ΛMX⅄Z" },
    12: { name: "Antico", map: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩" },
    13: { name: "Stile Giapponese", map: "ﾑ乃cd乇ｷgんﾉﾌズﾚM刀のｱ尺丂ｲu√wﾒﾘ乙ﾑ乃cd乇ｷgんﾉﾌズﾚM刀のｱ尺丂ｲu√wﾒﾘ乙" },
    14: { name: "Decorato", map: "fℓσωєя ρσωєя (testo decorato)" }, // Gestito con logica a parte sotto
    15: { name: "Simboli", map: "αв¢∂єƒgнιנкℓмиσρqяѕтυνωкуzαв¢∂єƒgнιנкℓмиσρqяѕтυνωкуz" }
}

const handler = async (m, { conn, text }) => {
    if (!text) {
        let menu = "✨ *EDITOR FONT DISPONIBILI* ✨\n\n"
        menu += "Uso: `.font [numero] [testo]`\n"
        menu += "Esempio: `.font 5 ciao` o `.font 11 prova`\n\n"
        
        Object.keys(fonts).forEach(id => {
            menu += `*${id}.* ${fonts[id].name}\n`
        })
        
        return m.reply(menu)
    }

    const args = text.split(" ")
    const fontIndex = args[0]
    let stringToTransform = args.slice(1).join(" ")

    if (!stringToTransform) return m.reply("❌ Inserisci il testo! Esempio: `.font 1 testo`")
    if (!fonts[fontIndex]) return m.reply("❌ Numero font non valido. Digita `.font` per la lista.")

    // Logica speciale per font invertiti o decorati
    if (fontIndex === "11") stringToTransform = stringToTransform.split('').reverse().join('')
    if (fontIndex === "14") {
        return m.reply(`✿.｡.:* ${stringToTransform} *.:｡.✿`)
    }

    const selectedFontArray = Array.from(fonts[fontIndex].map)
    const standardArray = Array.from(standard)
    let result = ""

    for (let char of stringToTransform) {
        let index = standardArray.indexOf(char)
        if (index !== -1) {
            result += selectedFontArray[index] || char
        } else {
            result += char
        }
    }

    await conn.sendMessage(m.chat, { text: result }, { quoted: m })
}

handler.help = ['font']
handler.tags = ['tools']
handler.command = /^font$/i

export default handler
