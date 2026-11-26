import { redirect } from 'next/navigation'

/** Admission and contact enquiries now live in Leads (one list for every source). */
export default function OldEnquiriesPage() {
  redirect('/admin/leads?type=CONTACT')
}
