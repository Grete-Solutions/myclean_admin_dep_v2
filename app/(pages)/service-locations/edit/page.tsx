import { Suspense } from "react"
import EditServiceLocationContent from "./editServiceLocationContent"

// Force dynamic rendering to prevent static generation
export const dynamic = "force-dynamic"

function LoadingFallback() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
}

export default function EditServiceLocationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditServiceLocationContent />
    </Suspense>
  )
}
