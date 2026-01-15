import type { Inquiry } from '../../types/inquiry'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'

interface InquiryCardProps {
  inquiry: Inquiry
}

export default function InquiryCard({ inquiry }: InquiryCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: inquiry.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    border: '1px solid #e0e0e0',
    padding: 12,
    borderRadius: 6,
    background: '#fff',
    cursor: 'grab',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  } as const

  return (
    <article
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-inquiry-id={inquiry.id}
      aria-label={`inquiry-card-${inquiry.id}`}
      style={style}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{inquiry.title}</h3>
        <Link
          to={`/admin/inquiries/${inquiry.id}`}
          aria-label={`view-inquiry-${inquiry.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ fontSize: 13, textDecoration: 'none', padding: '4px 8px', background: '#eef', borderRadius: 6 }}
        >
          View
        </Link>
      </div>

      {inquiry.badges.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {inquiry.badges.map((b, idx) => (
            <span
              key={`${b}-${idx}`}
              style={{
                background: '#f1f1f1',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {inquiry.assignee && (
        <div style={{ fontSize: 13, color: '#555' }}>Assignee: {inquiry.assignee}</div>
      )}
    </article>
  )
}
