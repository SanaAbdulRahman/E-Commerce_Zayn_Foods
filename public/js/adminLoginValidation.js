const form = document.getElementById("form");
const errMsg = document.getElementById("errMsg");

let usernameRegex = /^[a-zA-Z0-9]+$/;
function showError(error) {
  console.log(error);
  errMsg.innerHTML = `<span class="text-danger">${error} </span>`;
}

form.onsubmit = (e) => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    if (username === "" || password === "") {
      showError("Make sure you have entered all fields");
      return false;
    } else if (!username.match(usernameRegex)) {
      showError(
        "Your username is not valid. Only characters A-Z, a-z and '-', numbers are  acceptable"
      );
      return false;
    } else if (password.length < 5) {
      showError(
        "Make sure your password contains atleast 5 charecters or numbers"
      );
      return false;
    } else if (password.length > 16) {
      showError(
        "Your password is too long make sure it is less than 16 charecters or numbers"
      );
      return false;
    }
  };
  