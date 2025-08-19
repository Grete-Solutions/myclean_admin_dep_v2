import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    // Get the authentication token
    const tokenInfo = await getToken({ req })
    const token = tokenInfo?.idToken

    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 })
    }

    const { title, body, priority, tokens } = await req.json()

    // Log incoming request data
    console.log("=== FCM NOTIFICATION REQUEST ===")
    console.log("Title:", title)
    console.log("Body:", body)
    console.log("Priority:", priority)
    console.log("Number of tokens:", tokens?.length || 0)
    console.log("Tokens:", tokens)
    console.log("================================")

    // Validate tokens array
    if (!Array.isArray(tokens) || tokens.length === 0) {
      console.log("❌ Validation failed: Invalid tokens array")
      return NextResponse.json({ message: "Invalid input: At least one recipient token is required" }, { status: 400 })
    }

    // Validate that all tokens are non-empty strings
    if (!tokens.every((token: unknown) => typeof token === "string" && token.trim() !== "")) {
      console.log("❌ Validation failed: Some tokens are not valid strings")
      return NextResponse.json({ message: "Invalid input: All tokens must be non-empty strings" }, { status: 400 })
    }

    console.log("✅ Token validation passed")

    // Send notifications individually for each token
    const results = []
    const errors: { token: string; message: string }[] = []

    for (let i = 0; i < tokens.length; i++) {
      const currentToken = tokens[i]
      console.log(`\n--- Processing token ${i + 1}/${tokens.length} ---`)
      console.log("Token:", currentToken)

      const payload = {
        title,
        body,
        priority,
        registrationToken: currentToken,
      }

      console.log("Payload being sent:", JSON.stringify(payload, null, 2))

      try {
        const response = await fetch(`${process.env.URLB}/notification/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenInfo.idToken}`,
          },
          body: JSON.stringify(payload),
        })

        console.log(`Response status for token ${currentToken}:`, response.status)

        if (!response.ok) {
          const errorData = await response.json()
          console.log(`❌ Failed for token ${currentToken}:`, errorData)
          errors.push({ token: currentToken, message: errorData.message || "Failed to send notification" })
          continue
        }

        const data = await response.json()
        console.log(`✅ Response data for token ${currentToken}:`, data)
        
        // Check if the response indicates success
        if (data.success === false) {
          console.log(`❌ Backend reported failure for token ${currentToken}:`, data.error || data.message)
          errors.push({ 
            token: currentToken, 
            message: data.error || data.message || "Backend reported failure" 
          })
          continue
        }

        console.log(`✅ Success confirmed for token ${currentToken}`)
        results.push({ token: currentToken, data })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
        console.log(`❌ Exception for token ${currentToken}:`, errorMessage)
        errors.push({ token: currentToken, message: errorMessage })
      }
    }

    // Log final results summary
    console.log("\n=== FINAL RESULTS SUMMARY ===")
    console.log("Successful sends:", results.length)
    console.log("Failed sends:", errors.length)
    console.log(
      "Success tokens:",
      results.map((r) => r.token),
    )
    console.log(
      "Failed tokens:",
      errors.map((e) => e.token),
    )
    console.log("=============================")

    // Return aggregated response
    if (errors.length > 0 && results.length === 0) {
      // All requests failed
      console.log("🔴 All notifications failed")
      return NextResponse.json(
        {
          message: "Failed to send notifications",
          errors: errors.map((err) => ({ token: err.token, message: err.message })),
        },
        { status: 500 },
      )
    } else if (errors.length > 0) {
      // Partial success
      console.log("🟡 Partial success - some notifications failed")
      return NextResponse.json(
        {
          message: "Some notifications failed to send",
          results: results.map((res) => ({ token: res.token, data: res.data })),
          errors: errors.map((err) => ({ token: err.token, message: err.message })),
        },
        { status: 207 }, // Multi-Status
      )
    }

    // All requests succeeded
    console.log("🟢 All notifications sent successfully")
    return NextResponse.json({
      message: "Notifications sent successfully",
      results: results.map((res) => ({ token: res.token, data: res.data })),
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("💥 Error sending notifications:", error.message)
      console.error("Stack trace:", error.stack)
      return NextResponse.json({ message: error.message }, { status: 500 })
    } else {
      console.error("💥 Unknown error:", error)
      return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
    }
  }
}