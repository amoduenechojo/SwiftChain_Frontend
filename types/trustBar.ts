export interface SupportedNetwork {
  id: string;
  name: string;
  logoSvg: string;
}

export interface SecondaryStat {
  id: string;
  label: string;
  value: string;
  subtext?: string;
}

export interface TrustBarResponse {
  header: string;
  networks: SupportedNetwork[];
  stats: SecondaryStat[];
}
