// hibinka51-client/src/shared/services.tsx
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import GroupsIcon from "@mui/icons-material/Groups";
import SnowboardingIcon from "@mui/icons-material/Snowboarding";

export const services = [
  {
    title: "Доставка сотрудников",
    description:
      "Организация регулярных маршрутов для персонала компаний. Надежная доставка до места работы и обратно.",
    icon: <BusinessCenterIcon />,
  },
  {
    title: "Трансфер для туристов",
    description:
      "Встреча в аэропорту, перевозка групп и горнолыжного снаряжения для отдыха в Кировске и области.",
    icon: <SnowboardingIcon />,
  },
  {
    title: "Вахтовые перевозки",
    description:
      "Профессиональная доставка сменного персонала предприятий по всей Мурманской области.",
    icon: <DirectionsBusIcon />,
  },
  {
    title: "Частные трансферы",
    description:
      "Аренда микроавтобуса с водителем для экскурсий, праздников и индивидуальных поездок.",
    icon: <GroupsIcon />,
  },
];
