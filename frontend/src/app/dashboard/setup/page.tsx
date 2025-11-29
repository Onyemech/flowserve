'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

interface Bank {
  name: string
  code: string
  id: number
}

export default function SetupPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCheckingName, setIsCheckingName] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([])
  const [bankSearch, setBankSearch] = useState('')
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    bank_code: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBanks()
  }, [])

  useEffect(() => {
    if (bankSearch) {
      const filtered = banks.filter(bank =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase())
      )
      setFilteredBanks(filtered)
    } else {
      setFilteredBanks(banks)
    }
  }, [bankSearch, banks])

  // Auto-verify when account number reaches 10 digits
  useEffect(() => {
    if (formData.account_number.length === 10 && formData.bank_code && !formData.account_name && !isVerifying) {
      verifyAccount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.account_number, formData.bank_code])

  const fetchBanks = async () => {
    try {
      const response = await fetch('https://api.paystack.co/bank')
      const data = await response.json()
      if (data.status) {
        setBanks(data.data)
        setFilteredBanks(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error)
      showToast('error', 'Failed to load banks')
    }
  }

  const checkBusinessNameAvailability = async (name: string): Promise<boolean> => {
    if (!name.trim()) return false
    setIsCheckingName(true)
    try {
      const response = await fetch(`/api/profile/check-business-name?name=${encodeURIComponent(name)}`)
      const data = await response.json()
      if (data.exists) {
        setErrors(prev => ({ ...prev, business_name: 'This business name is already taken. Please choose a different name.' }))
        return false
      }
      setErrors(prev => ({ ...prev, business_name: '' }))
      return true
    } catch (error) {
      console.error('Error checking business name:', error)
      return true // Allow submission on error
    } finally {
      setIsCheckingName(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required'
    if (!formData.business_type) newErrors.business_type = 'Business type is required'
    if (!formData.bank_name) newErrors.bank_name = 'Bank name is required'
    if (!formData.account_number) newErrors.account_number = 'Account number is required'
    if (!formData.account_name.trim()) newErrors.account_name = 'Account name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const verifyAccount = async () => {
    if (!formData.bank_code || !formData.account_number) {
      return
    }
    if (formData.account_number.length !== 10) {
      return
    }
    setIsVerifying(true)
    try {
      const response = await fetch('/api/payments/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: formData.account_number,
          bank_code: formData.bank_code,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        // Fail silently - user can enter manually
        console.log('Auto-verify failed:', data.error)
        return
      }
      setFormData(prev => ({ ...prev, account_name: data.account_name }))
      showToast('success', 'Account verified!')
    } catch (error: any) {
      // Fail silently - user can enter manually
      console.log('Auto-verify error:', error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      showToast('error', 'Please fill in all required fields')
      return
    }

    // Check business name availability before submitting
    const isAvailable = await checkBusinessNameAvailability(formData.business_name)
    if (!isAvailable) {
      showToast('error', 'This business name is already taken')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        // Handle unique constraint violation from database
        if (data.error?.includes('duplicate') || data.error?.includes('unique_business_name')) {
          setErrors({ business_name: 'This business name is already taken. Please choose a different name.' })
          throw new Error('This business name is already taken')
        }
        throw new Error(data.error || 'Setup failed')
      }
      showToast('success', 'Profile setup complete!')
      router.push('/dashboard')
    } catch (error: any) {
      showToast('error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const selectBank = (bank: Bank) => {
    setFormData({ ...formData, bank_name: bank.name, bank_code: bank.code, account_name: '' })
    setBankSearch(bank.name)
    setShowBankDropdown(false)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#102216] flex items-center justify-center px-4 py-8 font-['Inter']">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.svg" alt="FlowServe AI" width={200} height={60} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Tell us about your business to get started</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Business Name
                {isCheckingName && <span className="ml-2 text-xs text-blue-600">Checking availability...</span>}
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => {
                  setFormData({ ...formData, business_name: e.target.value })
                  // Clear error when typing
                  if (errors.business_name) {
                    setErrors({ ...errors, business_name: '' })
                  }
                }}
                onBlur={() => {
                  // Check availability when user finishes typing
                  if (formData.business_name.trim()) {
                    checkBusinessNameAvailability(formData.business_name)
                  }
                }}
                placeholder="My Business Ltd"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              />
              {errors.business_name && <p className="mt-1 text-sm text-red-500">{errors.business_name}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This name must be unique and will be used for customer connections</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Business Type</label>
              <select
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
              >
                <option value="">Select business type</option>
                <option value="real_estate">Real Estate Sales</option>
                <option value="event_planning">Event Planning</option>
              </select>
              {errors.business_type && <p className="mt-1 text-sm text-red-500">{errors.business_type}</p>}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Settlement Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Paystack payments will be automatically transferred to this account
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value)
                      setShowBankDropdown(true)
                    }}
                    onFocus={() => setShowBankDropdown(true)}
                    placeholder="Search for your bank..."
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                  {showBankDropdown && filteredBanks.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredBanks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => selectBank(bank)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.bank_name && <p className="mt-1 text-sm text-red-500">{errors.bank_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Account Number
                    {isVerifying && <span className="ml-2 text-xs text-blue-600">Verifying...</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setFormData({ ...formData, account_number: value, account_name: '' })
                    }}
                    placeholder="0123456789"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                  {errors.account_number && <p className="mt-1 text-sm text-red-500">{errors.account_number}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Account will be verified automatically when you enter 10 digits
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Account Name
                    {formData.account_name && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Verified</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="Enter account name or verify automatically"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                  />
                  {errors.account_name && <p className="mt-1 text-sm text-red-500">{errors.account_name}</p>}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Will auto-verify when you enter 10 digits, or you can type it manually
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4A90E2] text-white rounded-lg font-semibold hover:bg-[#4A90E2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
