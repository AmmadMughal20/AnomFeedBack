
import { Html, Head, Font, Body, Text, Button, Preview, Section, Row, Heading } from '@react-email/components';

interface VerificationEmailProps
{
    username: string,
    otp: string
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps)
{
    return (
        <Html lang="en" dir="lte">
            <Head>
                <title>Verify your account</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Font
                    fontFamily="Roboto"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Here&apos;s your verification code: {otp}</Preview>
            <Section>
                <Row>
                    <Heading as="h2"> Hello {username},</Heading>
                </Row>
                <Row>
                    <Text> Hello {username},</Text>
                </Row>
                <Row>
                    <Text>
                        Thank you for registering. Please use the following
                        verification code to complete your registration
                    </Text>
                </Row>
                <Row>
                    <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {otp}
                    </Text>
                </Row>
                <Row>
                    <Text>
                        if you did not request this, please ignore this email.
                    </Text>
                </Row>
                {/* <Row>

                </Row> */}
            </Section>
        </Html>)
}