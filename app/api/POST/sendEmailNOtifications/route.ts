import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the authentication token
    const tokenInfo = await getToken({ req });
    const token = tokenInfo?.idToken;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const { title, message, email } = await req.json();

    // Log incoming request data
    console.log("=== EMAIL NOTIFICATION REQUEST ===");
    console.log("Title:", title);
    console.log("Message:", message);
    console.log("Email:", email);
    console.log("================================");

    // Validate input
    if (!title || typeof title !== "string" || title.trim() === "") {
      console.log("❌ Validation failed: Invalid title");
      return NextResponse.json({ message: "Invalid input: Title is required and must be a non-empty string" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      console.log("❌ Validation failed: Invalid message");
      return NextResponse.json({ message: "Invalid input: Message is required and must be a non-empty string" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.log("❌ Validation failed: Invalid email");
      return NextResponse.json({ message: "Invalid input: Valid email is required" }, { status: 400 });
    }

    console.log("✅ Input validation passed");

    // Prepare payload for the external API
    const payload = {
      title,
      message,
      email,
    };

    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    // Send request to external Cloud Run endpoint
    const response = await fetch(
      `${process.env.URLB}/notification/send-notification-to-users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    console.log(`Response status for email ${email}:`, response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Unknown error",
      }));
      console.log(`❌ Failed for email ${email}:`, errorData);
      return NextResponse.json(
        { message: `Failed to send email notification: ${errorData.message || `HTTP error! status: ${response.status}`}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Response data for email ${email}:`, data);

    // Check if the response indicates success
    if (data.success === false) {
      console.log(`❌ Backend reported failure for email ${email}:`, data.error || data.message);
      return NextResponse.json(
        { message: data.error || data.message || "Backend reported failure" },
        { status: 500 }
      );
    }

    console.log(`✅ Success confirmed for email ${email}`);
    return NextResponse.json({
      message: "Email notification sent successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("💥 Error sending email notification:", error.message);
      console.error("Stack trace:", error.stack);
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      console.error("💥 Unknown error:", error);
      return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
    }
  }
}
