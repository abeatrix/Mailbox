document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
  
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-form').onsubmit = send_email;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

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
    load_mailbox('inbox');
    return false;
  };

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`/emails/${mailbox}`)
  .then(res=>res.json())
  .then(emails=>{
    console.log(emails)
    emails.forEach(email=>display_email(email,mailbox))
  })

}

function display_email(email,mailbox){
  console.log('displaying'+mailbox)
  console.log(email)
  const email_div = document.createElement('div');
  const recipient_div = document.createElement('div');
  const subject_div = document.createElement('div');
}
