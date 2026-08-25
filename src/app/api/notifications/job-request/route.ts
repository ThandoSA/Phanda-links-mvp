import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function normalizePhone(value?: string | null) {
  if (!value) return null

  const digits = value.replace(/\D/g, "")
  if (!digits) return null

  if (digits.startsWith("0") && digits.length === 10) {
    return `+27${digits.slice(1)}`
  }

  if (digits.startsWith("27") && digits.length === 11) {
    return `+${digits}`
  }

  if (digits.startsWith("+")) {
    return digits
  }

  if (digits.length >= 10) {
    return `+${digits}`
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { workerId, clientName, jobTitle, amount, jobUrl } = body || {}

    if (!workerId) {
      return NextResponse.json({ ok: false, error: "Missing workerId" }, { status: 400 })
    }

    const adminSupabase = getAdminSupabase()
    const clientEmail = process.env.RESEND_API_KEY ? "" : ""
    const clientPhone = process.env.TWILIO_ACCOUNT_SID ? "" : ""

    let workerEmail: string | null = null
    let workerPhone: string | null = null

    if (adminSupabase) {
      const { data: workerData, error } = await adminSupabase.auth.admin.getUserById(workerId)
      if (!error && workerData?.user) {
        workerEmail = workerData.user.email || null
        workerPhone = (workerData.user.user_metadata as Record<string, unknown> | undefined)?.phone as string | null
      }
    }

    if (!workerEmail && !workerPhone) {
      return NextResponse.json({ ok: true, attempted: false, reason: "No worker contact available" })
    }

    const formattedAmount = Number(amount || 0)
    const safeClientName = clientName || "A client"
    const safeJobTitle = jobTitle || "a job"
    const safeJobUrl = jobUrl || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/worker/active-jobs`

    let emailSent = false
    let smsSent = false

    if (workerEmail && process.env.RESEND_API_KEY) {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Phanda Links <${fromEmail}>`,
          to: [workerEmail],
          subject: `New job request from ${safeClientName}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
              <h2 style="margin-bottom: 8px;">You have a new job request</h2>
              <p><strong>${safeClientName}</strong> has requested your help for <strong>${safeJobTitle}</strong>.</p>
              <p><strong>Budget:</strong> R${formattedAmount.toLocaleString()}</p>
              <p>Please log in to Phanda Links to review and accept the request.</p>
              <p><a href="${safeJobUrl}" style="display:inline-block; background:#D4AF37; color:#111; padding:12px 18px; border-radius:999px; text-decoration:none; font-weight:bold;">Review request</a></p>
            </div>
          `,
        }),
      })

      emailSent = emailResponse.ok
      if (!emailResponse.ok) {
        const text = await emailResponse.text()
        console.error("Resend email error:", text)
      }
    }

    const normalizedPhone = normalizePhone(workerPhone)

    if (normalizedPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      const body = new URLSearchParams({
        From: process.env.TWILIO_PHONE_NUMBER,
        To: normalizedPhone,
        Body: `You have a new job request from ${safeClientName} for R${formattedAmount.toLocaleString()} on Phanda Links. Log in to accept: ${safeJobUrl}`,
      }).toString()

      const twilioResponse = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        }
      )

      smsSent = twilioResponse.ok
      if (!twilioResponse.ok) {
        const text = await twilioResponse.text()
        console.error("Twilio SMS error:", text)
      }
    }

    return NextResponse.json({
      ok: true,
      attempted: true,
      emailSent,
      smsSent,
      workerEmail: workerEmail || null,
      workerPhone: normalizedPhone || null,
    })
  } catch (error: any) {
    console.error("Job request notification error:", error)
    return NextResponse.json({ ok: false, error: error?.message || "Notification failed" }, { status: 500 })
  }
}
