const form = document.getElementById('signInForm');
const showMsg = document.getElementById('SignInErrMsg');


form.addEventListener('submit', (e) => {
const username = document.getElementById('SignInUsername').value;
const password = document.getElementById('SignInPassword').value;

console.log(username, 'username');
console.log(password, 'password');
})