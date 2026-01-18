interface WorkboxLifecycleWaitingEvent {
  sw: ServiceWorker
  originalEvent: Event
}

interface WorkboxMessageEvent {
  data: any
  ports: readonly MessagePort[]
  originalEvent: ExtendableMessageEvent
}

interface Workbox {
  active: Promise<ServiceWorker>
  controlling: Promise<ServiceWorker>
  register: (options?: RegistrationOptions) => Promise<ServiceWorkerRegistration | undefined>
  update: () => Promise<void>
  addEventListener: (
    type: 'waiting' | 'externalwaiting' | 'controlling' | 'activated' | 'installed' | 'message',
    listener: (event: WorkboxLifecycleWaitingEvent | WorkboxMessageEvent) => void
  ) => void
  removeEventListener: (
    type: 'waiting' | 'externalwaiting' | 'controlling' | 'activated' | 'installed' | 'message',
    listener: (event: WorkboxLifecycleWaitingEvent | WorkboxMessageEvent) => void
  ) => void
  messageSW: (message: any) => Promise<void>
  messageSkipWaiting: () => Promise<void>
}

interface Window {
  workbox: Workbox
}
