import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // In a real application, you would integrate with an SMS service like:
    // - Twilio
    // - AWS SNS
    // - Africa's Talking (for Tanzania)
    // - Vonage

    // For now, we'll simulate sending an SMS using the SMS_API_KEY
    const apiKey = process.env.SMS_API_KEY

    if (!apiKey) {
      throw new Error("SMS API key not configured")
    }

    console.log("Sending SMS:", { to, message })

    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
    })
  } catch (error) {
    console.error("SMS sending failed:", error)
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 })
  }
}
