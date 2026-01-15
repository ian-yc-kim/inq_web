import type { Inquiry } from '../../types/inquiry'

interface InquiryCardProps {
  inquiry: Inquiry
}

export default function InquiryCard({ inquiry }: InquiryCardProps) {
  return (
    <article
      draggable={true}
      data-inquiry-id={inquiry.id}
      aria-label={`inquiry-card-${inquiry.id}`}
      style={{
        border: '1px solid #e0e0e0',
        padding: 12,
        borderRadius: 6,
        background: '#fff',
        cursor: 'grab',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>{inquiry.title}</h3>

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
