package email

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

type Service struct {
	cfg Config
}

func NewService(cfg Config) *Service {
	return &Service{cfg: cfg}
}

func (s *Service) SendOTP(to, purpose, otp string) error {
	subject, body := buildOTPEmail(purpose, otp)
	return s.send(to, subject, body)
}

func buildOTPEmail(purpose, otp string) (string, string) {
	switch purpose {
	case "register":
		return "รหัส OTP สำหรับสมัครสมาชิก TIBA",
			fmt.Sprintf(`<div style="font-family:sans-serif;max-width:480px;margin:auto">
<h2 style="color:#1f4488">สมัครสมาชิก TIBA</h2>
<p>รหัส OTP ของคุณคือ:</p>
<div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f4488;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">%s</div>
<p style="color:#666;font-size:13px">รหัสนี้มีอายุ <strong>5 นาที</strong> กรุณาอย่าเปิดเผยรหัสนี้แก่ผู้อื่น</p>
</div>`, otp)
	case "forgot_password":
		return "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน TIBA",
			fmt.Sprintf(`<div style="font-family:sans-serif;max-width:480px;margin:auto">
<h2 style="color:#1f4488">รีเซ็ตรหัสผ่าน TIBA</h2>
<p>รหัส OTP สำหรับรีเซ็ตรหัสผ่านของคุณคือ:</p>
<div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f4488;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">%s</div>
<p style="color:#666;font-size:13px">รหัสนี้มีอายุ <strong>5 นาที</strong> หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉย</p>
</div>`, otp)
	case "sub_member":
		return "รหัส OTP สำหรับเพิ่มบัญชีผู้แทนรอง TIBA",
			fmt.Sprintf(`<div style="font-family:sans-serif;max-width:480px;margin:auto">
<h2 style="color:#1f4488">เพิ่มบัญชีผู้แทนรอง TIBA</h2>
<p>รหัส OTP สำหรับยืนยันการเพิ่มบัญชีผู้แทนรองของคุณคือ:</p>
<div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f4488;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">%s</div>
<p style="color:#666;font-size:13px">รหัสนี้มีอายุ <strong>5 นาที</strong></p>
</div>`, otp)
	default:
		return "รหัส OTP จาก TIBA",
			fmt.Sprintf(`<div style="font-family:sans-serif;max-width:480px;margin:auto">
<h2 style="color:#1f4488">รหัส OTP จาก TIBA</h2>
<div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1f4488;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">%s</div>
<p style="color:#666;font-size:13px">รหัสนี้มีอายุ <strong>5 นาที</strong></p>
</div>`, otp)
	}
}

func (s *Service) send(to, subject, htmlBody string) error {
	if s.cfg.Host == "" || s.cfg.Username == "" || s.cfg.Password == "" {
		// Dev mode: just log
		fmt.Printf("[EMAIL DEV] To: %s | Subject: %s | Body: %s\n", to, subject, stripHTML(htmlBody))
		return nil
	}

	msg := buildMessage(s.cfg.From, to, subject, htmlBody)
	addr := s.cfg.Host + ":" + s.cfg.Port

	auth := smtp.PlainAuth("", s.cfg.Username, s.cfg.Password, s.cfg.Host)

	tlsCfg := &tls.Config{ServerName: s.cfg.Host}
	conn, err := tls.Dial("tcp", addr, tlsCfg)
	if err != nil {
		// Fallback to STARTTLS on port 587
		return smtp.SendMail(addr, auth, s.cfg.From, []string{to}, []byte(msg))
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.cfg.Host)
	if err != nil {
		return err
	}
	defer client.Quit()

	if err = client.Auth(auth); err != nil {
		return err
	}
	if err = client.Mail(s.cfg.From); err != nil {
		return err
	}
	if err = client.Rcpt(to); err != nil {
		return err
	}
	w, err := client.Data()
	if err != nil {
		return err
	}
	_, err = w.Write([]byte(msg))
	if err != nil {
		return err
	}
	return w.Close()
}

func buildMessage(from, to, subject, htmlBody string) string {
	headers := fmt.Sprintf(
		"From: TIBA <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n",
		from, to, subject,
	)
	return headers + htmlBody
}

func stripHTML(s string) string {
	var b strings.Builder
	inTag := false
	for _, r := range s {
		if r == '<' {
			inTag = true
		} else if r == '>' {
			inTag = false
		} else if !inTag {
			b.WriteRune(r)
		}
	}
	return b.String()
}
