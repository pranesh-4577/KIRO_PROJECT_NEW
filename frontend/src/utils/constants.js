export const COMPLAINT_CATEGORIES = [
  { value: 'Electrical', label: 'Electrical', icon: '⚡' },
  { value: 'Plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'Internet/Wi-Fi', label: 'Internet / Wi-Fi', icon: '📶' },
  { value: 'Classroom', label: 'Classroom', icon: '🏫' },
  { value: 'Hostel', label: 'Hostel', icon: '🏠' },
  { value: 'Cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'Security', label: 'Security', icon: '🔒' },
  { value: 'Other', label: 'Other', icon: '📋' },
]

export const COMPLAINT_PRIORITIES = [
  { value: 'Low', label: 'Low', color: 'low' },
  { value: 'Medium', label: 'Medium', color: 'medium' },
  { value: 'High', label: 'High', color: 'high' },
  { value: 'Critical', label: 'Critical', color: 'critical' },
]

export const COMPLAINT_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'pending' },
  { value: 'ASSIGNED', label: 'Assigned', color: 'assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'inprogress' },
  { value: 'RESOLVED', label: 'Resolved', color: 'resolved' },
  { value: 'REJECTED', label: 'Rejected', color: 'rejected' },
]

// Valid status transitions (admin only)
export const STATUS_TRANSITIONS = {
  PENDING: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: [],
  REJECTED: [],
}

export const BUILDINGS = [
  'Main Block',
  'Science Block',
  'Engineering Block',
  'Arts Block',
  'Library Block',
  'Hostel A',
  'Hostel B',
  'Hostel C',
  'Sports Complex',
  'Administrative Block',
  'Canteen Building',
  'Other',
]

export const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor']

export const MAX_IMAGE_SIZE_MB = 5
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
