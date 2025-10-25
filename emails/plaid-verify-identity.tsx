import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Section,
  Hr,
  Preview,
  Img,
} from '@react-email/components';

interface OtpEmailProps {
  otpCode: string;
  titlee: string
}
 const logo_url = 'https://www.dropbox.com/scl/fi/al2wqasb186wf4a4c1rcl/logo.png?rlkey=mko7e13ingetwejh3sgzl8u45&st=btsw44ew&dl=1'

export const OTPEmail = ({ otpCode, titlee }: OtpEmailProps) => (
  <Html lang="vi">
    <Head />
    <Preview>Mã xác thực OTP của bạn (hiệu lực 5 phút)</Preview>
    <Body style={body}>
      <Container style={container}>

        <Section style={logoSection}>
          <Img 
            src={logo_url} 
            width='120' // Kích thước đề xuất
            height='120' // Kích thước đề xuất
            alt='logo Thổ Mộc' 
            style={logo} 
          />
        </Section>
    
        <Heading style={title}>{titlee}</Heading>
        <Text style={paragraph}>
          Xin chào,<br />
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.<br />
          Dưới đây là mã xác thực (OTP) của bạn:
        </Text>

        <Section style={otpContainer}>
          <Text style={otpCodeStyle}>{otpCode}</Text>
        </Section>

        <Text style={paragraph}>
          Mã có hiệu lực trong <strong>5 phút</strong>.<br />
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </Text>

        <Hr style={divider} />

        <Section style={footer}>
          <Text style={footerText}>Địa chỉ công ty của bạn tại đây</Text>
          <Text style={footerCopy}>© 2025 Your Company. All rights reserved.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

/* ------------------ Styles ------------------ */
const body = {
  backgroundColor: '#f6f6f6',
  fontFamily: 'Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '20px 0',
  WebkitFontSmoothing: 'antialiased',
  fontSize: '14px',
  lineHeight: '1.4',
};

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '6px',
  padding: '24px',
  maxWidth: '580px',
  margin: '0 auto',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
};

const title = {
  textAlign: 'center' as const,
  color: '#333333',
  marginTop: 0,
  marginBottom: '24px',
  fontSize: '24px',
};

const paragraph = {
  fontSize: '16px',
  color: '#333333',
  lineHeight: '1.6',
  marginBottom: '12px',
  textAlign: 'center' as const,
};

const otpContainer = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  padding: '14px 28px',
  margin: '20px auto',
  width: 'fit-content',
};

const otpCodeStyle = {
  fontFamily: 'monospace',
  fontSize: '28px',
  letterSpacing: '4px',
  color: '#333333',
  textAlign: 'center' as const,
};

const divider = {
  borderTop: '1px solid #eaeaea',
  margin: '24px 0',
};

const footer = {
  textAlign: 'center' as const,
  fontSize: '13px',
  color: '#999999',
};

const footerText = {
  margin: '0 0 8px',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
  marginBottom: '8px',
  display: 'inline-block',
};

const footerCopy = {
  margin: 0,
};

const logoSection = {
    textAlign: 'center' as const, 
    paddingTop: '30px', 
    paddingBottom: '30px',
};

const logo = {
  margin: '0 auto',
  display: 'block' as const, 
};