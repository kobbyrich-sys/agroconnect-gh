// Paystack public key - replace with your actual key from https://dashboard.paystack.com
// For testing in Ghana, use a test key from paystack.com
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxx'

// Ensure Paystack script is loaded
function loadPaystackScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

export async function payWithPaystack(params: {
  email: string
  amount: number // in GHS (will be converted to pesewas)
  reference?: string
  metadata?: Record<string, any>
  onSuccess: (reference: string) => void
  onClose?: () => void
}) {
  await loadPaystackScript()

  const reference = params.reference || 'AGRO-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)

  const handler = (window as any).PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: params.email,
    amount: Math.round(params.amount * 100), // GHS → pesewas
    currency: 'GHS',
    ref: reference,
    metadata: params.metadata || {},
    callback: (response: any) => {
      params.onSuccess(response.reference)
    },
    onClose: () => {
      params.onClose?.()
    },
  })

  handler.openIframe()
}
