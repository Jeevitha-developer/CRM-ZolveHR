const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SUPPORT_EMAIL_PASS,
  },
});

const sendMail = async (to, subject, text, html) => {
  return transporter.sendMail({
    from: `"Zolvehr" <${process.env.SUPPORT_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendMail };
