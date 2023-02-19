import * as nodemailer from 'nodemailer';
import { ErrorLog } from './error.helper';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  service: process.env.EMAIL_SERVICE,
  // ignoreTLS: true,
  // secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMail(to, subject, user, body): Promise<any> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: `<div id=":n3" class="ii gt" jslog="20277; u014N:xr6bB; 4:W251bGwsbnVsbCxbXV0.">
        <div id=":n2" class="a3s aiL">
          <div class="adM"></div>
          <u></u>
      
          <div bgcolor="#E1E1E1" marginwidth="0" marginheight="0">
            <div
              style="
                max-width: 600px;
                background: #fff;
                border: 1px solid #dbdbdb;
                margin: 20px auto;
              "
            >
              <img style="width: 100%" />
              <div style="padding-left: 10px; padding-bottom: 20px">
                <h3
                  style="
                    font-size: 24px;
                    color: #c20006;
                    margin-top: 20px;
                    text-transform: capitalize;
                  "
                >
                  Hello ${user},
                </h3>
                ${body}
                <div>
                  <p style="margin: 0">Regards,</p>
                  <p style="margin: 0">${process.env.APP_NAME}</p>
                  <div class="yj6qo"></div>
                  <div class="adL"></div>
                </div>
                <div class="adL"></div>
              </div>
              <div class="adL"></div>
            </div>
            <div class="adL"></div>
          </div>
          <div class="adL"></div>
        </div>
      </div>
      `,
  };
  // console.log(mailOptions, 'mail optoion ');
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      ErrorLog(error);
    } else {
      return console.log('Email sent: ' + info.response, to);
    }
  });
}
