import nodemailer from 'nodemailer';

// Create a transporter
// For local development, we'll use Ethereal (fake SMTP) or just log to console if no creds
const createTransporter = async () => {
    // If you have real credentials, put them in .env
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback to Ethereal for testing
    // const testAccount = await nodemailer.createTestAccount();
    // console.log(`Ethereal credentials: ${testAccount.user} / ${testAccount.pass}`);

    // return nodemailer.createTransport({
    //     host: 'smtp.ethereal.email',
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: testAccount.user, // generated ethereal user
    //         pass: testAccount.pass, // generated ethereal password
    //     },
    // });

    // Final fallback: Just log to console (simulated)
    return {
        sendMail: async (mailOptions) => {
            console.log('----------------------------------------------------');
            console.log('📧 EMAIL SIMULATION (No SMTP configured)');
            console.log(`To: ${mailOptions.to}`);
            console.log(`Subject: ${mailOptions.subject}`);
            console.log(`Text: ${mailOptions.text}`);
            console.log(`HTML: ${mailOptions.html}`);
            console.log('----------------------------------------------------');
            return { messageId: 'simulated-123' };
        }
    };
};

export const sendEmail = async (options) => {
    const transporter = await createTransporter();

    const message = {
        from: `${process.env.FROM_NAME || 'CripTik Support'} <${process.env.FROM_EMAIL || 'noreply@criptik.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    if (info.preview) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};
