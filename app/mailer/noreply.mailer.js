import nodemailer from "nodemailer";
import { logger } from '../common/index.js';
import { mailing_details } from './config';

export async function noreply_mail(to_email, subject, text, html, transaction) {
    
    let transporter = nodemailer.createTransport({
        host: (await mailing_details).host_default,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: (await mailing_details).no_reply_email_default, // noreply user
            pass: (await mailing_details).no_reply_email_password_default, // noreply password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    });

    transporter.verify(async function (error, success) {
        if (error) {
            logger.error("❌ Error connecting to email connection <noreply_mail>");
        } else {
            logger.info("<noreply_mail> Email connection successful 🚀");
            
            try {
                let send_email = await transporter.sendMail({
                    from: `'"${(await mailing_details).no_reply_email_name_default}" <${(await mailing_details).no_reply_email_default}>'`,
                    to: to_email,
                    subject,
                    text,
                    html
                });

                logger.info(`<noreply_mail> Email sent: ${send_email.messageId}`);
            } catch (err) {
                logger.error("❌ Error sending <noreply_mail> email");
            }
        }
    });

};
