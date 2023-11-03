const nodeMailer = require("nodemailer");

const USERNAME = process.env.GMAIL_USERNAME;
const PASSWORD = process.env.GMAIL_PASSWORD;

const sendMessageToAdmin = async (name, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const subject = `Message from ${name} `;
      const body = `<p> ${message}</p>`;
      const fromEmail = "dev.adbulvajid@gmail.com";
      const TO_EMAIL = "dev.adbulvajid@gmail.com";

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

module.exports = sendMessageToAdmin;
