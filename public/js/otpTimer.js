const startingMinutes = 3;
let time = localStorage.getItem("remainingTime") || startingMinutes * 60;

const countDown = document.getElementById("otpTimer");
setInterval(updateCountDown, 1000);

function updateCountDown() {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  seconds = seconds < 10 ? "0" + seconds : seconds;

  if (minutes >= 00 && seconds >= 00) {
    countDown.innerHTML = `Resend Otp within 0${minutes} : ${seconds}`;
    localStorage.setItem("remainingTime", time);
  } else {
    countDown.innerHTML = `<a onclick="resendotp()">Resend OTP</a>`;
    localStorage.removeItem("remainingTime");
  }
  time--;
}

function resendotp() {
    let reUsername = document.getElementById("reUsername").value;
    let reFullname = document.getElementById("reFullname").value;
    let rePhoneNumber = document.getElementById("rePhoneNumber").value;
    let reEmail = document.getElementById("reEmail").value;
    let rePassword = document.getElementById("rePassword").value;
    let reFlatNo = document.getElementById("reFlatNo").value;
    let reStreet = document.getElementById("reStreet").value;
    let reLandmark = document.getElementById("reLandmark").value;
    let reDistrict = document.getElementById("reDistrict").value;
    let rePincode = document.getElementById("rePincode").value;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: reUsername,
        fullname: reFullname,
        phoneNumber: rePhoneNumber,
        email: reEmail,
        password: rePassword,
        flatNo: reFlatNo,
        street: reStreet,
        landmark: reLandmark,
        pincode: rePincode,
        district: reDistrict,
      }),
    };
    fetch("/postSendOtp", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        console.log("data.username", data.data.username)
        reUsername = data.data.username
        reFullname = data.data.fullname
        rePhoneNumber = data.data.phoneNumber
        reEmail = data.data.email
        reFlatNo = data.data.flatNo
        reStreet = data.data.street
        reLandmark = data.data.landmark
        rePincode = data.data.pincode
        reDistrict = data.data.district
        rePassword = data.data.password
        generatedOTP = data.data.generatedOTP
        $(".js-panel-otp").addClass("show-header-myaccount");
        $(".js-panel-editInfo").removeClass("show-header-myaccount");
        $(".js-panel-otp").addClass("js-hide-editInfo js-show-otp");

        $(".js-hide-otp").on("click", function () {
          $(".js-panel-otp").removeClass("show-header-myaccount");
          location.replace('/');
        });

      })
      .catch((error) => {
        console.log(error, "error");
        showError('errMsg', error.message);
      });
  };


