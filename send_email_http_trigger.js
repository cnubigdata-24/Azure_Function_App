const { app } = require('@azure/functions');
const nodemailer = require('nodemailer');

// HTTP 트리거로 이메일 발송하는 Azure Function
app.http('sendEmail', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('HTTP trigger function processed a request.');

        try {
            // 요청에서 이메일 정보 추출
            const method = request.method;
            let emailData;

            if (method === 'POST') {
                emailData = await request.json();
            } else {
                // GET 요청의 경우 쿼리 파라미터에서 추출
                emailData = {
                    to: request.query.get('to'),
                    subject: request.query.get('subject'),
                    text: request.query.get('text')
                };
            }

            // 필수 필드 검증
            if (!emailData.to || !emailData.subject || !emailData.text) {
                return {
                    status: 400,
                    jsonBody: {
                        error: 'Missing required fields: to, subject, text'
                    }
                };
            }

            // 이메일 전송
            const result = await sendEmail(emailData);

            return {
                status: 200,
                jsonBody: {
                    message: 'Email sent successfully',
                    messageId: result.messageId
                }
            };

        } catch (error) {
            context.log.error('Error sending email:', error);
            return {
                status: 500,
                jsonBody: {
                    error: 'Failed to send email',
                    details: error.message
                }
            };
        }
    }
});

// 이메일 발송 함수
async function sendEmail(emailData) {
    // 이메일 설정 (환경변수에서 가져오기)
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // 발송자 이메일
            pass: process.env.SMTP_PASS  // 앱 비밀번호 또는 OAuth2 토큰
        }
    });

    // 이메일 옵션 설정
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || null // HTML 내용이 있는 경우
    };

    // 첨부파일이 있는 경우
    if (emailData.attachments) {
        mailOptions.attachments = emailData.attachments;
    }

    // 이메일 전송
    const info = await transporter.sendMail(mailOptions);
    return info;
}
