"use node";

import { SESClient, SendEmailCommand, type SendEmailCommandInput } from "@aws-sdk/client-ses";
import type { SESClientConfig } from "@aws-sdk/client-ses";

// SES client singleton - lazy initialization
let _sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!_sesClient) {
    const config: SESClientConfig = {
      region: process.env.AWS_SES_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      maxAttempts: 3,
    };
    _sesClient = new SESClient(config);
  }
  return _sesClient;
}

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const FROM_NAME = process.env.FROM_NAME || "Company";

// Simple email sending (no attachments)
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<void> {
  const client = getSESClient();

  const input: SendEmailCommandInput = {
    Source: options.from || `${FROM_NAME} <${FROM_EMAIL}>`,
    Destination: {
      ToAddresses: [options.to],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: options.subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: options.html,
        },
        ...(options.text && {
          Text: {
            Charset: "UTF-8",
            Data: options.text,
          },
        }),
      },
    },
  };

  const command = new SendEmailCommand(input);
  await client.send(command);
}

export { FROM_EMAIL, FROM_NAME };
