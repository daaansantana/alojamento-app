// One interface per sheet. Keys match the JSON (= the Excel headers) exactly.

/** quartos.json */
export interface Room {
  id: number;
  name: string;
  type: string; // "Suite", "Duplo", "Twin", "Familiar", "Estúdio", "Individual"
  capacity: number;
  price_per_night: number;
}

/** reservas.json. room_id links to Room.id */
export interface Booking {
  id: number;
  room_id: number;
  guest_name: string;
  guest_email: string;
  country: string;
  check_in: string; // "2025-11-01", text in the JSON
  check_out: string; // "2025-11-03", text in the JSON
  nights: number;
  guests: number;
  channel: string; // "Direto", "Airbnb", "Booking"
  total: number;
  status: string; // "Concluída", "Confirmada", "Cancelada"
}
