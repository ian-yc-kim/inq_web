import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import Board from './Board'

// mocks
vi.mock('../../services/inquiryService')
vi.mock('../../services/socketService')

// Mock dnd-kit/core to capture onDragEnd handler and provide helpers
vi.mock('@dnd-kit/core', () => {
  const React = require('react')
  let _handler: any = null
  function DndContext(props: any) {
    _handler = props.onDragEnd
    return React.createElement(React.Fragment, null, props.children)
  }
  function useSensor() {
    return () => null
  }
  function useSensors() {
    return []
  }
  const PointerSensor = () => null
  function useDroppable() {
    return { setNodeRef: (el: any) => {} }
  }
  return {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable,
    __getHandler: () => _handler,
  }
})

vi.mock('@dnd-kit/sortable', () => {
  const React = require('react')
  function SortableContext(props: any) {
    return React.createElement(React.Fragment, null, props.children)
  }
  function useSortable() {
    return {
      setNodeRef: (el: any) => {},
      attributes: {},
      listeners: {},
      transform: null,
      transition: undefined,
    }
  }
  return { SortableContext, useSortable }
})

import * as inquiryService from '../../services/inquiryService'
import * as socketService from '../../services/socketService'
import * as dnd from '@dnd-kit/core'

const sample = [
  { id: 'n1', title: 'New 1', status: 'NEW', badges: [] },
  { id: 'h1', title: 'Hold 1', status: 'ON_HOLD', badges: [] },
  { id: 'c1', title: 'Done 1', status: 'COMPLETED', badges: [] },
]

describe('Board integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    ;(inquiryService.getInquiries as any) = vi.fn().mockResolvedValue(sample)
    ;(inquiryService.updateInquiry as any) = vi.fn().mockImplementation((id: string, status: string) => Promise.resolve({ ...sample.find((s) => s.id === id), status }))
    ;(socketService.connect as any) = vi.fn()
    ;(socketService.subscribe as any) = vi.fn().mockImplementation(() => () => {})
    ;(socketService.disconnect as any) = vi.fn()
  })

  it('renders inquiries in correct columns', async () => {
    render(<Board />)

    await waitFor(() => expect(screen.getByText('New 1')).toBeInTheDocument())

    const newCol = screen.getByLabelText('kanban-column-NEW')
    const holdCol = screen.getByLabelText('kanban-column-ON_HOLD')
    const doneCol = screen.getByLabelText('kanban-column-COMPLETED')

    expect(within(newCol).getByText('New 1')).toBeInTheDocument()
    expect(within(holdCol).getByText('Hold 1')).toBeInTheDocument()
    expect(within(doneCol).getByText('Done 1')).toBeInTheDocument()
  })

  it('calls updateInquiry on drag end and updates optimistically', async () => {
    render(<Board />)

    await waitFor(() => expect(screen.getByText('New 1')).toBeInTheDocument())

    const handler = (dnd as any).__getHandler()
    expect(handler).toBeTruthy()

    // simulate dragging New 1 to ON_HOLD
    await handler({ active: { id: 'n1' }, over: { id: 'ON_HOLD' } })

    expect(inquiryService.updateInquiry).toHaveBeenCalledWith('n1', 'ON_HOLD')

    // card should now appear under ON_HOLD column
    const holdCol = screen.getByLabelText('kanban-column-ON_HOLD')
    await waitFor(() => expect(within(holdCol).getByText('New 1')).toBeInTheDocument())
  })

  it('reverts on update failure', async () => {
    ;(inquiryService.updateInquiry as any) = vi.fn().mockRejectedValue(new Error('fail'))
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<Board />)

    await waitFor(() => expect(screen.getByText('New 1')).toBeInTheDocument())

    const handler = (dnd as any).__getHandler()

    await handler({ active: { id: 'n1' }, over: { id: 'ON_HOLD' } })

    // After failure, should be reverted to original column
    const newCol = screen.getByLabelText('kanban-column-NEW')
    await waitFor(() => expect(within(newCol).getByText('New 1')).toBeInTheDocument())

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
