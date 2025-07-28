import type { Payment } from "@/lib/types"

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "canceled"
  clientSecret: string
}

export interface PaymentMethod {
  id: string
  type: "card" | "mobile_money" | "bank_transfer"
  details: {
    last4?: string
    brand?: string
    phoneNumber?: string
    bankName?: string
  }
}

export class PaymentService {
  static async createPaymentIntent(amount: number, currency = "TZS"): Promise<PaymentIntent> {
    // Simulate Stripe payment intent creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      id: `pi_${Date.now()}`,
      amount,
      currency,
      status: "requires_payment_method",
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  static async confirmPayment(paymentIntentId: string, paymentMethod: PaymentMethod): Promise<Payment> {
    // Simulate payment confirmation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      bookingId: "", // Will be set by the booking service
      amount: 0, // Will be set by the booking service
      currency: "TZS",
      method: paymentMethod.type,
      status: success ? "completed" : "failed",
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!success) {
      throw new Error("Payment failed. Please try again or use a different payment method.")
    }

    return payment
  }

  static async processRefund(paymentId: string, amount?: number): Promise<Payment> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return {
      id: `refund_${Date.now()}`,
      bookingId: "",
      amount: amount || 0,
      currency: "TZS",
      method: "card",
      status: "refunded",
      transactionId: `refund_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  static formatCurrency(amount: number, currency = "TZS"): string {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }
}
