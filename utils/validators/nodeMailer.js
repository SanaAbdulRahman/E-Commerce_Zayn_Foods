const nodeMailer = require("nodemailer");

const USERNAME = process.env.GMAIL_USERNAME;
const PASSWORD = process.env.GMAIL_PASSWORD;
const OPT_TTL = process.env.OPT_TTL;

const sendEmail = async (otp, TO_EMAIL) => {
  return new Promise(async (resolve, reject) => {
    try {
      const subject = `OTP from Fud Hub`;
      const body = `<p> Your OTP to Sign up fudHub is ${otp} </p> <p>This OTP is valid only for ${OPT_TTL} minutes</p>`;
      const fromEmail = "dev.adbulvajid@gmail.com";

      console.log(TO_EMAIL, 'TO_EMAIL')

      let transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: USERNAME,
          pass: PASSWORD,
        },
      });

      let mailOptions = {
        from: fromEmail, // sender address
        to: TO_EMAIL, // list of receivers
        subject: subject, // Subject line
        html: body, // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err.message);
        } else if (!info || info === undefined || info == null) {
          reject("Error occured while sending email");
        } else {
          resolve(info);
        }
      });
    } catch (error) {
      console.error(error, "Error in nodemailer");
    }
  });
};

module.exports = sendEmail;
