"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    description: 'For individual recruiters and small HR teams',
    monthlyPrice: 1999,
    annualPrice: 1599,
    features: [
      '10 JD generations/month',
      '10 Talent Intelligence analyses/month',
      '10 Interview kits/month',
      'Synlumex AI JD format',
      'Download as .docx',
      '1 user seat',
      'Email support',
      '3-day free trial',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing companies and active hiring teams',
    monthlyPrice: 3999,
    annualPrice: 3199,
    features: [
      '50 JD generations/month',
      '50 Talent Intelligence analyses/month',
      '50 Interview kits/month',
      'Advanced AI interview scoring',
      'Boolean search builder',
      'Global salary intelligence',
      'Team collaboration (3 seats)',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with complex hiring needs',
    monthlyPrice: null,
    annualPrice: null,
    features: [
      'Unlimited JD generations',
      'Unlimited Talent Intelligence',
      'Unlimited interview kits',
      'Unlimited users',
      'Dedicated success manager',
      'SLA guarantees',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const router = useRouter()

  const getPrice = (plan: any) => {
    if (plan.monthlyPrice === null) return 'Custom'
    return isAnnual ? plan.annualPrice : plan.monthlyPrice
  }

  const handleClick = (plan: any) => {
    if (plan.name === 'Enterprise') {
      router.push('/contact')
    } else {
      router.push('/synlumex/login')
    }
  }

  return (
    <section id="pricing" className="py-20 bg-white">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-4xl font-bold text-[#081225]">
          Start Hiring Smarter <br />
          <span className="text-[#4DA8FF]">Today</span>
        </h2>
        <p className="text-[#081225]/70 mt-3">
          Choose the plan that fits your team. All plans include a 3-day free trial.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#F5F7FA] p-1 rounded-full flex">
          
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-full text-sm ${
              !isAnnual ? 'bg-white text-[#081225]' : 'text-[#081225]/60'
            }`}
          >
            Monthly
          </button>

          <button
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-full text-sm ${
              isAnnual ? 'bg-white text-[#081225]' : 'text-[#081225]/60'
            }`}
          >
            Annual <span className="text-green-600 ml-1">Save 20%</span>
          </button>

        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">

        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`rounded-2xl p-6 border ${
              plan.popular
                ? 'border-[#4DA8FF] shadow-lg'
                : 'border-[#081225]/10'
            }`}
          >

            {/* Title */}
            <h3 className="text-xl font-bold text-[#081225]">{plan.name}</h3>
            <p className="text-sm text-[#081225]/60 mt-1">
              {plan.description}
            </p>

            {/* Price */}
            <div className="mt-6">
              <p className="text-3xl font-bold text-[#081225]">
                {typeof getPrice(plan) === 'number' && '₹'}
                {getPrice(plan)}
              </p>
              <p className="text-sm text-[#081225]/60">/ month</p>
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-[#081225]/70">
                  <Check className="w-4 h-4 text-green-500 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              className="w-full mt-6 bg-[#4DA8FF] text-[#081225]"
              onClick={() => handleClick(plan)}
            >
              {plan.cta}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

          </motion.div>
        ))}

      </div>
    </section>
  )
}
