import React from 'react'
import { getPriorityBadgeClass } from '../../utils/helpers'

export default function PriorityBadge({ priority }) {
  return <span className={getPriorityBadgeClass(priority)}>{priority}</span>
}
