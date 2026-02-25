export interface HealthStatus {
  service: string;
  status: "ok";
  timestamp: string;
}

export function getServiceHealth(service: string): HealthStatus {
  return {
    service,
    status: "ok",
    timestamp: new Date().toISOString()
  };
}
