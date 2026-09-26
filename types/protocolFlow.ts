export interface ProtocolStep {
  id: number
  number: string // "01", "02", "03"
  title: string
  description: string
  status: 'completed' | 'active' | 'pending'
}

export interface MapLocation {
  id: string
  name: string
  lat: number
  lng: number
  status: 'active' | 'inactive' | 'completed'
}

export interface ProtocolFlowData {
  steps: ProtocolStep[]
  mapLocations: MapLocation[]
  title: string
  subtitle: string
}
