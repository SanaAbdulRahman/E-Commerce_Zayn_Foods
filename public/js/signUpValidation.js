const errMsg = document.getElementById("errMsg");

let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let usernameRegex = /^[a-zA-Z0-9]+$/;

function showError(error) {
  errMsg.innerHTML = `<div class="alert alert-danger alert-dismissible fade show py-1 pe-5" role="alert">
  ${error}
</div>`;
}

document
  .getElementById("signUpform")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("signUpUsername").value;
    const fullname = document.getElementById("signUpFullname").value;
    // const phoneNumber = document.getElementById("SignUpPhoneNumber").value;
    const email = document.getElementById("signUpEmail").value;
    const flatNo = document.getElementById("signUpFlatNo").value;
    const street = document.getElementById("signUpStreet").value;
    const landmark = document.getElementById("signUpLandmark").value;
    const district = document.getElementById("signUpDistrict").value;
    const password = document.getElementById("signUpPassword").value;
    const confirmPassword = document.getElementById(
      "signUpConfirmPassword"
    ).value;

    if (
      username == "" ||
      fullname == "" ||
      email == "" ||
      password == "" ||
      confirmPassword == "" ||
      flatNo == "" ||
      street == "" ||
      landmark == "" ||
      district == ""
    ) {
      showError("Make sure you have entered all fields");
      return false;
    } else if (!email.match(mailformat)) {
      showError("You have entered an invalid email address");
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
    } else if (password !== confirmPassword) {
      showError("Password doesn't match");
      return false;
    }
     else {
      // form is valid, submit it
      this.submit();
    }
  });
