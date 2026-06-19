//by Bonzino

let handler = async (m) => {
  m.reply(
`*📂 𝐏𝐀𝐓𝐇*

\`\`\`
${process.cwd()}
\`\`\`

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
  )
}
handler.help = ['path']
handler.tags = ['owner']
handler.command = ['path']
handler.owner = true
export default handler