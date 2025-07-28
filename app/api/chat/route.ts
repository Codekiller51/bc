import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Brand Connect",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for Brand Connect, a platform that connects creative professionals with clients in Tanzania. 

Your role is to:
- Help users navigate the platform
- Answer questions about services, booking, and payments
- Provide information about creative professionals
- Assist with account-related queries
- Offer general support and guidance

Be friendly, professional, and concise. Always try to direct users to the appropriate sections of the platform when relevant.

Key features of Brand Connect:
- Browse and book creative professionals (graphic designers, photographers, videographers, digital marketers)
- Secure payment system with escrow protection
- Real-time messaging between clients and creatives
- Portfolio showcasing for creative professionals
- Review and rating system
- Location-based search across Tanzania

If you cannot answer a specific question, politely direct the user to contact support or use the help center.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get AI response")
    }

    const data = await response.json()
    const message = data.choices[0]?.message?.content || "I'm sorry, I couldn't process your request. Please try again."

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
