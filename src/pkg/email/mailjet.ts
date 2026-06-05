import Mailjet from "node-mailjet";
import { IEmailProvider } from "./email.interface";

export interface MailjetConfig {
  apiKey: string;
  apiSecret: string;
  fromEmail: string;
  fromName: string;
}

export class MailjetEmailProvider implements IEmailProvider {
  private readonly client: Mailjet;

  constructor(private readonly config: MailjetConfig) {
    this.client = new Mailjet.Client({
      apiKey: this.config.apiKey,
      apiSecret: this.config.apiSecret,
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.client.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: this.config.fromEmail,
              Name: this.config.fromName,
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
    } catch (error) {
      throw new Error("Failed to send email");
    }
  }
}
