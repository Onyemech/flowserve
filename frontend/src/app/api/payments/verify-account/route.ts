import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { account_number, bank_code } = await request.json()

    if (!account_number) {
      return NextResponse.json(
        { error: 'Account number is required' },
        { status: 400 }
      )
    }

    if (!bank_code) {
      return NextResponse.json(
        { error: 'Bank code is required' },
        { status: 400 }
      )
    }

    // Verify account with Paystack
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || 'Account verification failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      account_name: data.data.account_name,
      bank_code: bank_code,
    })
  } catch (error: any) {
    console.error('Account verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}
