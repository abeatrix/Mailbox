document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox')
});



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
  .catch(err=>console.log(err))

}


function list_email(email,mailbox){
  // console.log('listing email from '+mailbox)
  // console.log(email)

  // email div
  const e = document.createElement('div');
  e.id = 'email-item'
  e.className = 'row border border-dark mt-2 p-2';
  email.read ? e.className += ' bg-secondary' : null;

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
  e.addEventListener('click', () => read_email(email.id,mailbox));
  document.querySelector('#emails-view').append(e)

}


// Compose email view for composing new mail and replying mail
function compose_email(email) {
  //console.log(email)

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-email').style.display = 'none';
  document.querySelector('#compose-form').onsubmit = send_email;

  // if email value is not empty, it's  a reply email
  if (email.recipients) {
    const original_sender = email.sender,
          original_subject = email.subject,
          already_replied = email.subject.substring(0,3)==='RE:' ? '' : 'RE: ',
          prefill = '\nOn '+email.timestamp+' '+original_sender+' wrote:\n'+ email.body;
    document.querySelector('#compose-form-title').innerHTML = 'Reply Email';
    document.querySelector('#compose-recipients').value = original_sender;
    document.querySelector('#compose-subject').value = already_replied+original_subject;
    document.querySelector('#compose-body').value = prefill;
  } else {
    // Clear out composition fields
    document.querySelector('#compose-form-title').innerHTML = 'New Email';
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }

}

// send email
function send_email() {
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
  .then(()=>load_mailbox('sent'));
  
  return false;
};


function read_email(id,mailbox){
  // console.log(id,mailbox)
  // Show the individual email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'block';

  // hiding reply and archive buttons in sent box
  mailbox==='sent' ? document.querySelector('#buttons').style.display = 'none' : document.querySelector('#buttons').style.display = 'block';

  // GET data
  fetch("/emails/"+id)
  .then(res=>res.json())
  .then(email=>{
    // console.log(email);
    let archive_status;
    email.archived ? archive_status =  'Unarchive' : archive_status =  'Archive'; 
    mark_email(id);
    document.querySelector('#read-email-sender').innerHTML = email.sender;
    document.querySelector('#read-email-r').innerHTML = email.recipients;
    document.querySelector('#read-email-s').innerHTML = email.subject;
    document.querySelector('#read-email-t').innerHTML = email.timestamp;
    document.querySelector('#read-email-b').innerHTML = email.body;
    document.querySelector('#reply-btn').addEventListener('click', () => compose_email(email));
    document.querySelector('#archive-btn').innerHTML = archive_status;
    document.querySelector('#archive-btn').addEventListener('click', () => update_email(id, archive_status));
  })
  .catch(err=>console.log(err))

}

// Archive email 
function update_email(id, action){

  //console.log('archive email')
  let mode = null;
  console.log(id)
  switch(action){
    case 'Archive':
      mode = JSON.stringify({
        archived: true
      });
      break;
    case 'Unarchive':
      mode = JSON.stringify({
        archived: false
      });
      break;
  }

  // update data with PUT method
  fetch('/emails/'+id, {
    method: 'PUT', 
    body: mode
  })
  .then(window.location.reload())
  .catch(err=>console.log(err));

}


// mark email as read
function mark_email(id, action){

  // update data with PUT method
  fetch('/emails/'+id, {
    method: 'PUT', 
    body: JSON.stringify({
      read: true
    })
  })
  .then(res=>console.log(res))
  .catch(err=>console.log(err));

}