import type { ReactElement } from 'react';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCarRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphoneRounded';
import ChairIcon from '@mui/icons-material/ChairRounded';
import CheckroomIcon from '@mui/icons-material/CheckroomRounded';
import WorkIcon from '@mui/icons-material/WorkRounded';
import PetsIcon from '@mui/icons-material/PetsRounded';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccerRounded';
import ChildCareIcon from '@mui/icons-material/ChildCareRounded';
import HandymanIcon from '@mui/icons-material/HandymanRounded';
import MenuBookIcon from '@mui/icons-material/MenuBookRounded';
import MusicNoteIcon from '@mui/icons-material/MusicNoteRounded';
import SpaIcon from '@mui/icons-material/SpaRounded';

// Category keys come from the API; the icon is chosen by a keyword so new categories still get a sensible one.
const MATCHERS: [RegExp, ReactElement][] = [
  // Before the generic services: "personalServices" also contains "service".
  [/personal/i, <SpaIcon key="personal" />],
  [/vehic|car|auto|moto/i, <DirectionsCarIcon key="car" />],
  [/real|estate|inmueb|propert|home|house|hogar/i, <HomeIcon key="home" />],
  [/electr|phone|tech|comput|mobile/i, <PhoneIphoneIcon key="phone" />],
  [/furni|mueble|garden|jard/i, <ChairIcon key="chair" />],
  [/fashion|cloth|ropa|moda/i, <CheckroomIcon key="cloth" />],
  [/job|empleo|trabajo|work/i, <WorkIcon key="work" />],
  [/pet|mascot|animal/i, <PetsIcon key="pet" />],
  [/sport|deport|hobb/i, <SportsSoccerIcon key="sport" />],
  [/kid|baby|bebe|ni[nñ]o|child/i, <ChildCareIcon key="kid" />],
  [/service|servicio|tool|herram/i, <HandymanIcon key="tool" />],
  [/book|libro|educ/i, <MenuBookIcon key="book" />],
  [/music|musica|m[uú]sic/i, <MusicNoteIcon key="music" />],
];

export function categoryIcon(key: string): ReactElement {
  return MATCHERS.find(([re]) => re.test(key))?.[1] ?? <CategoryIcon />;
}
