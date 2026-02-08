const Imap = require('imap');

const imap = new Imap({
  user: 'dummyname1088@gmail.com',
  password: 'pricqmxpnpzozazz',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
    servername: 'imap.gmail.com'
  }
});

imap.once('ready', function() {
  console.log('Connected to Gmail!');
  
  // 1. Open the INBOX folder
  imap.openBox('INBOX', false, function(err, box) {
    if (err) {
      console.log('Error opening inbox:', err);
      return;
    }
    
    console.log('Inbox opened successfully');
    console.log('Total messages:', box.messages.total);
    
    // 2. Search for unread emails
    imap.search(['UNSEEN'], function(err, results) {
      if (err) {
        console.log('Search error:', err);
        return;
      }
      
      if (results.length === 0) {
        console.log('No unread emails found');
        imap.end();
        return;
      }
      
      console.log('Found', results.length, 'unread emails');
      
      // 3. Fetch email headers and body
      const fetch = imap.fetch(results, {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false // Don't mark as read yet
      });
      
      fetch.on('message', function(msg, seqno) {
        console.log('Processing email #' + seqno);
        
        let headers = {};
        let body = '';
        
        msg.on('body', function(stream, info) {
          let buffer = '';
          
          stream.on('data', function(chunk) {
            buffer += chunk.toString('utf8');
          });
          
          stream.once('end', function() {
            if (info.which === 'HEADER') {
              headers = Imap.parseHeader(buffer);
            } else if (info.which === 'TEXT') {
              body = buffer;
            }
          });
        });
        
        msg.once('end', function() {
          console.log('Email processed:', {
            from: headers.from,
            subject: headers.subject,
            date: headers.date
          });
          
          // Here you'll call your parsing function
          // parseEmailForLeads(headers, body);
          
          // 4. Mark as read after processing (optional)
          // imap.addFlags(seqno, ['\\Seen'], function(err) {
          //   if (err) console.log('Error marking as read:', err);
          // });
        });
      });
      
      fetch.once('error', function(err) {
        console.log('Fetch error:', err);
      });
      
      fetch.once('end', function() {
        console.log('Done fetching messages');
        imap.end();
      });
    });
  });
});

imap.once('error', function(err) {
  console.log('Connection error:', err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();