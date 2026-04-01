module.exports = {
  name: "prova1",
  command: ["prova1"],

  async execute(sock, msg, text, args) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "plugin aaa"
    });
  }
};