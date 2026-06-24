import { Router } from "express";
import { getUncachableResendClient } from "../lib/resend.js";

const contactRouter = Router();

const RECIPIENT_EMAIL = "info@praitconsulting.ca";

contactRouter.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, residency, employment, profile, interest } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    residency?: string;
    employment?: string;
    profile?: string;
    interest?: string;
  };

  if (!firstName || !lastName || !email || !interest) {
    res.status(400).json({ error: "First name, last name, email, and area of interest are required." });
    return;
  }

  const interestLabels: Record<string, string> = {
    "funded-career-programs": "Funded Career Programs (for Domestic Students)",
    "international-admissions": "International Admissions & Support",
    "corporate-training": "Corporate Training",
    "upskilling-bootcamps": "Upskilling Bootcamps",
    "business-consulting": "Business Consulting",
  };

  const interestLabel = interestLabels[interest ?? ""] ?? interest;
  const fullName = `${firstName} ${lastName}`;

  try {
    const { client, fromEmail } = await getUncachableResendClient();

    await client.emails.send({
      from: fromEmail,
      to: [RECIPIENT_EMAIL],
      replyTo: email,
      subject: `New Consultation Request — ${interestLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e;">
          <div style="background: #1a3a5c; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px;">New Consultation Request</h1>
            <p style="color: #a0c4e0; margin: 4px 0 0;">via PRAIT Consulting website</p>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 40%; color: #374151;">First Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${firstName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Last Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email Address</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #1a3a5c;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone Number</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Residency Status</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${residency || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Employment Status</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${employment || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Profile</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827;">${profile || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Area of Interest</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="background: #e0f2fe; color: #1a3a5c; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: bold;">${interestLabel}</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 28px; padding: 16px; background: #fff3cd; border-left: 4px solid #e07b00; border-radius: 4px;">
              <p style="margin: 0; font-size: 13px; color: #7a4f01;"><strong>Action needed:</strong> Reply directly to this email or reach ${fullName} at <a href="mailto:${email}">${email}</a></p>
            </div>
          </div>
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">PRAIT Consulting Inc. &mdash; info@praitconsulting.ca</p>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to send consultation email");
    res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
});

export default contactRouter;
