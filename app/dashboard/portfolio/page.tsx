"use client"

import { motion } from "framer-motion"
import { PortfolioManagement } from "@/components/portfolio-management"
import { withAuth } from "@/components/enhanced-auth-provider"

function PortfolioPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Portfolio</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your portfolio to showcase your best work to potential clients
        </p>
      </div>

      <PortfolioManagement />
    </motion.div>
  )
}

export default withAuth(PortfolioPage, 'creative')