import {
  LocalParkingOutlined,
  FitnessCenterOutlined,
  SecurityOutlined,
  PoolOutlined,
  AccountBalanceOutlined,
  ParkOutlined,
  DirectionsCarOutlined,
  HomeOutlined,
  WifiOutlined,
  VideocamOutlined,
  MeetingRoomOutlined,
  ElevatorOutlined,
  BoltOutlined,
  VerifiedOutlined,
  ArticleOutlined,
  AddRoadOutlined,
  FlightOutlined,
  WaterOutlined,
  RoomServiceOutlined,
  StarOutlineOutlined,
} from "@mui/icons-material";

const amenityIcons = {
  Parking:              LocalParkingOutlined,
  Gym:                  FitnessCenterOutlined,
  Security:             SecurityOutlined,
  "Swimming Pool":      PoolOutlined,
  "Club House":         AccountBalanceOutlined,
  Garden:               ParkOutlined,
  "Private Parking":    DirectionsCarOutlined,
  "Smart Home":         HomeOutlined,
  "High Speed Internet": WifiOutlined,
  CCTV:                 VideocamOutlined,
  "Conference Room":    MeetingRoomOutlined,
  Lift:                 ElevatorOutlined,
  "Power Backup":       BoltOutlined,
  "RERA Approved":      VerifiedOutlined,
  "Clear Title":        ArticleOutlined,
  "Road Access":        AddRoadOutlined,
  "Near Airport":       FlightOutlined,
  "Rooftop Pool":       WaterOutlined,
  Concierge:            RoomServiceOutlined,
  "Valet Parking":      DirectionsCarOutlined,
};

export default function AmenitiesGrid({ amenities = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {amenities.map((item) => {
        const Icon = amenityIcons[item] ?? StarOutlineOutlined;
        return (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold shadow-soft transition hover:border-gold-300 hover:bg-gold-50"
          >
            <Icon sx={{ fontSize: 20, color: "#6366f1" }} />
            <span>{item}</span>
          </div>
        );
      })}
    </div>
  );
}
