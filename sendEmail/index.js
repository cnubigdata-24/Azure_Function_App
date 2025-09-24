const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request.');

    try {
        // 요청에서 이메일 정보 추출
        const method = req.method;
        let emailData;

        if (method === 'POST') {
            emailData = req.body;
        } else {
            // GET 요청의 경우 쿼리 파라미터에서 추출
            emailData = {
                to: req.query.to,
                subject: req.query.subject,
                text: req.query.text
            };
        }

        // 필수 필드 검증
        if (!emailData.to || !emailData.subject || !emailData.text) {
            context.res = {
                status: 400,
                body: {
                    error: 'Missing required fields: to, subject, text'
                }
            };
            return;
        }

        // 이메일 전송
        const result = await sendEmail(emailData);

        context.res = {
            status: 200,
            body: {
                message: 'Email sent successfully',
                messageId: result.messageId
            }
        };

    } catch (error) {
        context.log.error('Error sending email:', error);
        context.res = {
            status: 500,
            body: {
                error: 'Failed to send email',
                details: error.message
            }
        };
    }
};

// 이메일 발송 함수
async function sendEmail(emailData) {
    // 이메일 설정 (환경변수에서 가져오기)
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    // 이메일 옵션 설정
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || null
    };

    // 첨부파일이 있는 경우
    if (emailData.attachments) {
        mailOptions.attachments = emailData.attachments;
    }

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    return info;
}
