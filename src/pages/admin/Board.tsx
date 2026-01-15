import React, { useEffect, useState } from 'react'
import type { Inquiry, InquiryStatus } from '../../types/inquiry'
import * as inquiryService from '../../services/inquiryService'
import * as socketService from '../../services/socketService'
import KanbanColumn from '../../components/Kanban/KanbanColumn'
import InquiryCard from '../../components/Kanban/InquiryCard'
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

function isStatus(id: string | undefined): id is InquiryStatus {
  if (!id) return false
  return id === 'NEW' || id === 'ON_HOLD' || id === 'COMPLETED'
}

export default function Board() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setIsLoading(true)
      try {
        const res = await inquiryService.getInquiries()
        if (mounted) setInquiries(res)
      } catch (err) {
        console.error('Board:', err)
        if (mounted) setError('Failed to load inquiries')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    try {
      socketService.connect()
      const unsub = socketService.subscribe((updated) => {
        try {
          setInquiries((prev) => {
            const idx = prev.findIndex((p) => p.id === updated.id)
            if (idx === -1) return prev
            const copy = [...prev]
            copy[idx] = updated
            return copy
          })
        } catch (e) {
          console.error('Board:', e)
        }
      })

      return () => {
        try {
          unsub()
          socketService.disconnect()
        } catch (e) {
          console.error('Board:', e)
        }
      }
    } catch (e) {
      console.error('Board:', e)
    }
  }, [])

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = async (event: { active: { id: string }; over: { id?: string } | null }) => {
    const activeId = event.active?.id
    const overId = event.over?.id
    if (!activeId || !overId) return

    // Find active inquiry and its previous status
    const activeInquiry = inquiries.find((i) => i.id === activeId)
    if (!activeInquiry) return

    let destinationStatus: InquiryStatus = activeInquiry.status

    if (isStatus(overId)) {
      destinationStatus = overId
    } else {
      // over is another card -> find that card's status
      const overInquiry = inquiries.find((i) => i.id === overId)
      if (overInquiry) destinationStatus = overInquiry.status
    }

    if (destinationStatus === activeInquiry.status) return

    const prev = inquiries
    // optimistic update
    setInquiries((prevState) => prevState.map((i) => (i.id === activeId ? { ...i, status: destinationStatus } : i)))

    try {
      const updated = await inquiryService.updateInquiry(activeId, destinationStatus)
      setInquiries((prevState) => prevState.map((i) => (i.id === updated.id ? updated : i)))
    } catch (err) {
      console.error('Board:', err)
      // revert
      setInquiries(prev)
    }
  }

  const byStatus = (status: InquiryStatus) => inquiries.filter((i) => i.status === status)

  return (
    <main>
      <h1>Inquiry Board</h1>
      {isLoading && <div>Loading...</div>}
      {error && <div role="alert">{error}</div>}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <KanbanColumn title="NEW">
            <SortableContext items={byStatus('NEW').map((i) => i.id)}>
              {byStatus('NEW').map((inq) => (
                <div key={inq.id} style={{ marginBottom: 8 }}>
                  <InquiryCard inquiry={inq} />
                </div>
              ))}
            </SortableContext>
          </KanbanColumn>

          <KanbanColumn title="ON_HOLD">
            <SortableContext items={byStatus('ON_HOLD').map((i) => i.id)}>
              {byStatus('ON_HOLD').map((inq) => (
                <div key={inq.id} style={{ marginBottom: 8 }}>
                  <InquiryCard inquiry={inq} />
                </div>
              ))}
            </SortableContext>
          </KanbanColumn>

          <KanbanColumn title="COMPLETED">
            <SortableContext items={byStatus('COMPLETED').map((i) => i.id)}>
              {byStatus('COMPLETED').map((inq) => (
                <div key={inq.id} style={{ marginBottom: 8 }}>
                  <InquiryCard inquiry={inq} />
                </div>
              ))}
            </SortableContext>
          </KanbanColumn>
        </div>
      </DndContext>
    </main>
  )
}
