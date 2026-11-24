'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  getExpensesAction,
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from '@/app/actions/expenseActions'
import { Icon } from '@iconify/react'
import { exportToCsv } from '@/lib/exportCsv'
import { canDeleteRecords, getRoleDisplayName } from '@/lib/roles'

const EXPENSE_CATEGORIES = [
  'Rent & Infrastructure',
  'Salaries & Faculty',
  'Marketing & Advertising',
  'Utilities & Electricity',
  'Office Supplies & Software',
  'Events & Workshops',
  'Maintenance & Cleaning',
  'Miscellaneous',
]

const PAYMENT_MODES = [
  'CASH',
  'UPI / GPAY',
  'BANK TRANSFER / NEFT',
  'CREDIT / DEBIT CARD',
  'CHEQUE',
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    paymentMode: PAYMENT_MODES[0],
    expenseDate: new Date().toISOString().slice(0, 10),
    receiptUrl: '',
  })

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const res = await getExpensesAction()
      if (res.success) {
        setExpenses(res.expenses || [])
        setCurrentUser(res.currentUser)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to fetch expenses' })
      }
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  // Metrics Calculations
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  const monthlyExpenses = expenses.filter((item) => {
    const d = new Date(item.expenseDate)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  })
  const monthlySum = monthlyExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  // Find top expense category
  const categoryMap: Record<string, number> = {}
  for (const exp of expenses) {
    categoryMap[exp.category] = (categoryMap[exp.category] || 0) + (exp.amount || 0)
  }
  let topCategory = 'None'
  let topCategorySum = 0
  for (const [cat, sum] of Object.entries(categoryMap)) {
    if (sum > topCategorySum) {
      topCategory = cat
      topCategorySum = sum
    }
  }

  const userRole = currentUser?.role || 'ADMIN'
  const canDelete = canDeleteRecords(userRole)

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      (exp.expenseNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (exp.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (exp.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (exp.createdByName || '').toLowerCase().includes(search.toLowerCase())

    let matchesCategory = true
    if (categoryFilter !== 'ALL') {
      matchesCategory = exp.category === categoryFilter
    }

    let matchesPaymentMode = true
    if (paymentModeFilter !== 'ALL') {
      matchesPaymentMode = exp.paymentMode === paymentModeFilter
    }

    let matchesDate = true
    if (fromDate) {
      const from = new Date(fromDate)
      from.setHours(0, 0, 0, 0)
      matchesDate = matchesDate && new Date(exp.expenseDate) >= from
    }
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      matchesDate = matchesDate && new Date(exp.expenseDate) <= to
    }

    return matchesSearch && matchesCategory && matchesPaymentMode && matchesDate
  })

  const openCreateModal = () => {
    setEditingExpense(null)
    setFormData({
      title: '',
      description: '',
      category: EXPENSE_CATEGORIES[0],
      amount: '',
      paymentMode: PAYMENT_MODES[0],
      expenseDate: new Date().toISOString().slice(0, 10),
      receiptUrl: '',
    })
    setShowModal(true)
  }

  const openEditModal = (expense: any) => {
    setEditingExpense(expense)
    setFormData({
      title: expense.title,
      description: expense.description || '',
      category: expense.category,
      amount: String(expense.amount),
      paymentMode: expense.paymentMode,
      expenseDate: new Date(expense.expenseDate).toISOString().slice(0, 10),
      receiptUrl: expense.receiptUrl || '',
    })
    setShowModal(true)
  }

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(formData.amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid positive expense amount' })
      return
    }

    startTransition(async () => {
      if (editingExpense) {
        const res = await updateExpenseAction(editingExpense.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          amount: numericAmount,
          paymentMode: formData.paymentMode,
          expenseDate: formData.expenseDate,
          receiptUrl: formData.receiptUrl,
        })
        if (res.success && res.expense) {
          setStatusMsg({ type: 'success', text: res.message || 'Expense updated successfully' })
          setExpenses((prev) =>
            prev.map((item) => (item.id === editingExpense.id ? { ...item, ...res.expense } : item))
          )
          setShowModal(false)
        } else {
          setStatusMsg({ type: 'error', text: res.error || 'Failed to update expense' })
        }
      } else {
        const res = await createExpenseAction({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          amount: numericAmount,
          paymentMode: formData.paymentMode,
          expenseDate: formData.expenseDate,
          receiptUrl: formData.receiptUrl,
        })
        if (res.success && res.expense) {
          setStatusMsg({ type: 'success', text: res.message || 'Expense recorded successfully' })
          setExpenses((prev) => [res.expense, ...prev])
          setShowModal(false)
        } else {
          setStatusMsg({ type: 'error', text: res.error || 'Failed to record expense' })
        }
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) return
    startTransition(async () => {
      const res = await deleteExpenseAction(id)
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message || 'Expense moved to Bin' })
        setExpenses((prev) => prev.filter((item) => item.id !== id))
        setConfirmDeleteId(null)
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete expense' })
        setConfirmDeleteId(null)
      }
    })
  }

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      setStatusMsg({ type: 'error', text: 'No expense records to export' })
      return
    }

    const headers = [
      'Expense Number',
      'Expense Date',
      'Title',
      'Category',
      'Amount (INR)',
      'Payment Mode',
      'Description',
      'Recorded By',
    ]

    const rows = filteredExpenses.map((exp) => [
      exp.expenseNumber,
      new Date(exp.expenseDate).toLocaleDateString(),
      exp.title,
      exp.category,
      exp.amount,
      exp.paymentMode,
      exp.description || '',
      exp.createdByName || '',
    ])

    exportToCsv(`institute_expenses_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
    setStatusMsg({ type: 'success', text: `Exported ${filteredExpenses.length} expense records to CSV` })
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Marketing & Advertising':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">{category}</span>
      case 'Rent & Infrastructure':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{category}</span>
      case 'Salaries & Faculty':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{category}</span>
      case 'Utilities & Electricity':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{category}</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{category}</span>
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="ion:receipt-outline" className="w-6 h-6 text-rose-600" />
              Expense Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              {getRoleDisplayName(userRole)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track institute operating expenses, category breakdown, payment vouchers, and financial summaries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Icon icon="ion:add-circle-outline" className="w-4 h-4" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={handleExport}
            disabled={filteredExpenses.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            title="Download CSV export"
          >
            <Icon icon="ion:download-outline" className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Spent</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{formatCurrency(totalExpenseSum)}</span>
            <span className="text-[11px] text-slate-400 font-medium">{expenses.length} total entries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Icon icon="ion:wallet-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-linear-to-br from-white to-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-900 uppercase tracking-wider block">This Month</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{formatCurrency(monthlySum)}</span>
            <span className="text-[11px] text-slate-500 font-medium">{currentMonthName}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <Icon icon="ion:calendar-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Top Category</span>
            <span className="text-lg font-black text-slate-900 mt-1 block truncate max-w-[150px]">{topCategory}</span>
            <span className="text-[11px] text-slate-400 font-medium">{formatCurrency(topCategorySum)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Icon icon="ion:pie-chart-outline" className="w-6 h-6" />
          </div>
        </div>

        {/* Average per entry */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Avg. Per Voucher</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {formatCurrency(expenses.length > 0 ? Math.round(totalExpenseSum / expenses.length) : 0)}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Average ticket size</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon icon="ion:calculator-outline" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            <Icon icon="ion:close" className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search expense by ID, title, notes, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-rose-600 focus:bg-white transition-all"
            />
            <Icon icon="ion:search-outline" className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Mode:</label>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            >
              <option value="ALL">All Payment Modes</option>
              {PAYMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Icon icon="ion:calendar-clear-outline" className="w-4 h-4 text-slate-500" />
              Date:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-600"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-600"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('')
                  setToDate('')
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Icon icon="ion:close-circle-outline" className="w-3.5 h-3.5" />
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading expense records...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm font-medium">No expenses found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[950px]">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Expense ID</th>
                  <th className="p-4">Title & Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Mode</th>
                  <th className="p-4">Expense Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-rose-50/30 transition-colors group">
                    <td className="p-4">
                      <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-xs inline-block">
                        {exp.expenseNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-base group-hover:text-rose-700 block">
                        {exp.title}
                      </span>
                      {exp.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[280px]">
                          {exp.description}
                        </p>
                      )}
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Recorded by {exp.createdByName || exp.createdBy?.fullName || 'Staff'}
                      </span>
                    </td>
                    <td className="p-4">{getCategoryBadge(exp.category)}</td>
                    <td className="p-4">
                      <span className="font-black text-slate-900 text-base block">
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {exp.paymentMode}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Icon icon="ion:create-outline" className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setConfirmDeleteId(exp.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Move to Bin"
                          >
                            <Icon icon="ion:trash-outline" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Icon icon="ion:receipt" className="w-6 h-6 text-rose-600" />
                  {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Log operational expense with receipt and category categorization
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <Icon icon="ion:close" className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Office Electricity Bill (November)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expense Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-rose-600"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-rose-600"
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expense Incurred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Description / Vendor Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the expense, vendor name, invoice reference, etc..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Receipt / Invoice URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon icon="ion:alert-circle" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete this expense record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This expense voucher will be moved to the Bin. Only the Super Admin can restore or delete it permanently.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
