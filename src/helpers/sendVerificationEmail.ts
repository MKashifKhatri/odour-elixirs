import nodemailer from "nodemailer"

type SendVerificationEmailParams = {
    email: string;
    id: string;
    name: string;
    verifyCode: string;
}

export async function sendVerificationEmail({email, id, name, verifyCode}: SendVerificationEmailParams) {

        const myEmail = process.env.EMAIL;
        const emailPassword = process.env.EMAIL_PASSWORD;
        const safeName = name.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character] || character));
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                  user: myEmail,
                  pass: emailPassword,
                },
              })

            const mailOption = {
                from: myEmail,
                to: email,
                subject: `Your Odour Elixirs verification code`,
                // html: VerificationEmail({username, otp: verifyCode})
                html: ` <html lang="en">
            <Head>
                <meta charSet="UTF-8" />
                <title>Odour Elixirs verification code</title>
            </Head>
            <body>
                <div style="max-width: 520px; margin: 24px auto; padding: 32px; background-color: #f6f2ea; border: 1px solid #ddd1c1; border-radius: 18px; color: #211814; font-family: Arial, sans-serif;">
                    <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #75685f;">Odour Elixirs</p>
                    <h2>Hello, ${ safeName },</h2>
                    <p>Thanks for joining us. Enter this verification code to finish creating your account:</p>
                    <p style="display: inline-block; padding: 14px 20px; border-radius: 12px; background: #fffdf8; font-size: 24px; font-weight: bold; letter-spacing: 6px;">${ verifyCode }</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <a href="${(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')}/verify/${id}" style="display: inline-block; padding: 12px 20px; background-color: #211814; color: #fffaf2; text-decoration: none; border-radius: 999px;">Verify account</a>
                </div>
            </body>
        </html>`
            }

            const mailresponse = await transporter.sendMail(mailOption);
            // console.log("message reponse", mailresponse);
              return {success: true, message: 'Verification email send Successfully'}
        } catch (emailError) {
            console.error("Error sending Verification email", emailError);
            return {success: false, message: 'Failed to send verification email'}
        }
    }
    
