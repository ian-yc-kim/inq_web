import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface KanbanColumnProps {
  title: string
  children?: React.ReactNode
}

export default function KanbanColumn({ title, children }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: title })

  return (
    <section
      ref={setNodeRef}
      aria-label={`kanban-column-${title}`}
      style={{
        flex: '1 1 0',
        minWidth: 220,
        margin: 8,
        padding: 12,
        background: '#f9f9f9',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>{title}</h2>
      <div>{children}</div>
    </section>
  )
}
