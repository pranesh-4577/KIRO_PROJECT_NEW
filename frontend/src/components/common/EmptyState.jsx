import React from 'react'
import { FileSearch } from 'lucide-react'

export default function EmptyState({ icon: Icon = FileSearch, title = 'No items found', description = '', action }) {
  return (
    <div className="empty-state">
      <Icon size={48} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
