const imapSimple = require('imap-simple');
const cfg = require('/home/ubuntu/.openclaw/workspace/.brazenauto-smtp.json');
const config = {
  imap: { user: cfg.user, password: cfg.pass, host: 'imap.gmail.com', port: 993, tls: true, authTimeout: 10000, tlsOptions: { rejectUnauthorized: false } }
};
imapSimple.connect(config).then(async conn => {
  await conn.openBox('INBOX');
  const msgs = await conn.search(['UNSEEN'], { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'], markSeen: false });
  console.log('Unread messages: ' + msgs.length);
  msgs.forEach(m => {
    const h = m.parts.find(p => p.which.includes('HEADER')).body;
    console.log((h.date||[''])[0] + ' | ' + (h.from||[''])[0] + ' | ' + (h.subject||[''])[0]);
  });
  conn.end();
}).catch(e => console.error('IMAP err:', e.message));
