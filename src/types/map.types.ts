export interface MapAlert {
  id: string;
  reporter_id: string;
  alert_type: 'police' | 'construction';
  lat: number;
  lng: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}
