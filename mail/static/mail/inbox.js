document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});


function compose_email(email) {
  //console.log(email)
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';
  document.querySelector('#compose-form').onsubmit = send_email;

  // if email is not empty, it's  a reply email
  if (email.recipients) {
    const e_recipients = email.recipients,
        e_sender = email.sender,
        e_subject = 'RE: '+email.subject,
        e_prefill = 'On '+email.timestamp+' '+e_sender+' wrote:\n'+ email.body;
    document.querySelector('#compose-form-title').innerHTML = 'Reply Email';
    document.querySelector('#compose-recipients').value = e_recipients;
    document.querySelector('#compose-subject').value = e_subject;
    document.querySelector('#compose-body').value = e_prefill;
  } else {
    // Clear out composition fields
    document.querySelector('#compose-form-title').innerHTML = 'New Email';
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

  // send email
  function send_email() {
    console.log('sending')
    const r = document.querySelector('#compose-recipients').value,
    s = document.querySelector('#compose-subject').value,
    b = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST', 
      body: JSON.stringify({
        recipients: r,
        subject: s,
        body: b,
      })
    })
    .then(res=>res.json())
    localStorage.clear();
    load_mailbox('sent');
    return false;
  };

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/'+mailbox)
  .then(res=>res.json())
  .then(emails=>{
    emails.forEach(email=>list_email(email,mailbox))
  })

}

function list_email(email,mailbox){

  // console.log('displaying'+mailbox)
  // console.log(email)

  // email div
  const e = document.createElement('div');
  e.id = 'email-item'
  e.className = 'row border border-dark mt-2 p-2';
  e.addEventListener('click', () => read_email(email.id));

  // recipient div
  const r = document.createElement('div');
  r.id = 'email-recipient';
  r.className = 'col';
  mailbox === 'inbox' 
  ? r.innerHTML = email.sender
  : r.innerHTML = email.recipients[0];

  // subject div
  const s = document.createElement('div');
  s.id = 'email-subject'
  s.className = 'col-6';
  s.innerHTML = email.subject;

  // timestamp div
  const t = document.createElement('div');
  t.id = 'email-subject'
  t.className = 'col'
  t.innerHTML = email.timestamp;


  e.append(r,s,t)

  document.querySelector('#emails-view').append(e)

}

function read_email(id){
  console.log(id)
    // Show the individual email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#read-email').style.display = 'block';

    fetch("/emails/"+id)
    .then(res=>res.json())
    .then(email=>{
      // console.log(email);
      document.querySelector('#read-email-sender').innerHTML = email.sender;
      document.querySelector('#read-email-r').innerHTML = email.recipients;
      document.querySelector('#read-email-s').innerHTML = email.subject;
      document.querySelector('#read-email-t').innerHTML = email.timestamp;
      document.querySelector('#read-email-b').innerHTML = email.body;
      document.querySelector('#reply-btn').addEventListener('click', () => compose_email(email));
    })

}