const standard = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const fonts = {
  1: { name: 'Grassetto', map: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝑽𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵' },
  2: { name: 'Corsivo', map: '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵' },
  3: { name: 'Monospazio', map: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔|𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚚𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿' },
  4: { name: 'Bolle', map: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨' },
  5: { name: 'Gotico', map: '𝔞𝔟𝔠𝔡℔𝔣𝔤𝔥𝔦𝔧𝔨𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ' },
  6: { name: 'Sottolineato', map: 'a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲' },
  7: { name: 'Quadrati', map: '🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄿🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉' },
  8: { name: 'Macchina Scrivere', map: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡' },
  9: { name: 'Piccolo Maiuscolo', map: 'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' },
  10: { name: 'Barrato', map: 'a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶' },
  11: { name: 'Specchio', map: 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎzⱯᗺϽᗡƎℲƃHIᒋʞ˥WNOԀΌᴚS⊥∩ΛMX⅄Z' },
  12: { name: 'Antico', map: '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩' },
  13: { name: 'Stile Giapponese', map: 'ﾑ乃cd乇ｷgんﾉﾌズﾚM刀のｱ尺丂ｲu√wﾒﾘ乙ﾑ乃cd乇ｷgんﾉﾌズﾚM刀のｱ尺丂ｲu√wﾒﾘ乙' },
  14: { name: 'Decorato', map: 'decorato' },
  15: { name: 'Simboli', map: 'αв¢∂єƒgнιנкℓмиσρqяѕтυνωкуzαв¢∂єƒgнιנкℓмиσρqяѕтυνωкуz' },
  16: { name: 'Grassetto Corsivo', map: '𝙖𝙗𝙘𝙙𝙚𝙯𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝕤𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕' },
  17: { name: 'Gotico Grassetto', map: '𝔶𝔷𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅𝔖𝔇𝔈𝔉𝔊𝔧𝔔𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔩' },
  18: { name: 'Doppio Sbarrato', map: 'a⃦b⃦c⃦d⃦e⃦f⃦g⃦h⃦i⃦j⃦k⃦l⃦m⃦n⃦o⃦p⃦q⃦r⃦s⃦t⃦u⃦v⃦w⃦x⃦y⃦z⃦A⃦B⃦C⃦D⃦E⃦F⃦G⃦H⃦I⃦J⃦K⃦L⃦M⃦N⃦O⃦P⃦Q⃦R⃦S⃦T⃦U⃦V⃦W⃦X⃦Y⃦Z⃦' },
  19: { name: 'Parentesi', map: '㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩✁✂✃✄✆✇✈✉✌✍✎✏✐✑✒✓✔✕✖✗✘✙✚✛✜✝✞✟✠✡✢✣✤✥✦✧' },
  20: { name: 'Corsivo Elegante', map: '𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵' },
  21: { name: 'Freccia In Alto', map: 'a🡡b🡡c🡡d🡡e🡡f🡡g🡡h🡡i🡡j🡡k🡡l🡡m🡡n🡡o🡡p🡡q🡡r🡡s🡡t🡡u🡡v🡡w🡡x🡡y🡡z🡡' },
  22: { name: 'Quadrate Piene', map: '🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆲🆁🆂🆃🆄🆅🆆🆇🆈🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆲🆁🆂🆃🆄🆅🆆🆇🆈' },
  23: { name: 'Sotto Sopra', map: 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsnʇnʌʍxʎzⱯᗺϽᗡƎℲפHI𝔗ʞ˥WNOԀὉᴚS⊥∩ΛMX⅄Z' },
  24: { name: 'Estetico', map: 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９' },
  25: { name: 'Invertito', map: 'zʎxʍʌnʇsɹbdouɯlʞɾᴉɥƃɟǝpɔqɐZ⅄X𝔗Λ∩𝕊𝔚ὉԀON𝕎˥ʞ𝔗I𝔖פℲƎ𝔖Ͻᗡ∀' }
}

const S = v => String(v || '')

function convertText(text, fontIndex) {
  if (fontIndex === '11' || fontIndex === '23') {
    text = text.split('').reverse().join('')
  }
  
  if (fontIndex === '14') {
    return `✿.｡.:* ${text} *.:｡.✿`
  }

  const selectedFontArray = Array.from(fonts[fontIndex].map)
  const standardArray = Array.from(standard)
  let result = ''

  for (const char of text) {
    const index = standardArray.indexOf(char)
    result += index !== -1 ? (selectedFontArray[index] || char) : char
  }
  return result
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    let menu = `*╭━━━━━━━✨━━━━━━━╮*\n*✦ 𝐄𝐃𝐈𝐓𝐎𝐑 𝐅𝐎𝐍𝐓 ✦*\n*╰━━━━━━━✨━━━━━━━╯*\n\n*𝐔𝐬ο:* .font [numero] [testo]\n*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* .font 5 ciao\n\n`

    Object.keys(fonts).forEach(id => {
      let previewName = convertText(fonts[id].name, id)
      menu += `*${id}.* ${previewName}\n`
    })

    return m.reply(menu.trim())
  }

  const args = text.trim().split(/\s+/)
  const fontIndex = args[0]
  let stringToTransform = args.slice(1).join(' ')

  if (!stringToTransform) {
    return m.reply('*𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐭𝐞𝐬𝐭𝐨.*\n*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* .font 1 testo')
  }

  if (!fonts[fontIndex]) {
    return m.reply('*𝐍𝐮𝐦𝐞𝐫ο 𝐟𝐨𝐧𝐭 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢dto.*\n*𝖣𝗂𝗀𝗂𝗍𝖺:* .font')
  }

  let finalResult = convertText(stringToTransform, fontIndex)
  await conn.sendMessage(m.chat, { text: finalResult }, { quoted: m })
}

handler.help = ['font']
handler.tags = ['tools']
handler.command = /^font$/i

export default handler
