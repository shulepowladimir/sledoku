import type { Level } from '../src/types/level';
import { tutorialLevel } from './00-tutorial';
import { apartmentLevel } from './01-apartment';
import { shopLevel } from './02-shop';
import { museumLevel } from './03-museum';
import { parkLevel } from './04-park';
import { wildwestLevel } from './05-wildwest';
import { wizardSchoolLevel } from './06-wizardschool';
import { officeLevel } from './07-office';
import { mallLevel } from './08-mall';
import { forestLevel } from './09-forest';
import { stationLevel } from './10-station';
import { egyptLevel } from './11-egypt';
import { spaceLevel } from './12-space';
import { hospitalLevel } from './13-hospital';
import { wildwest2Level } from './14-wildwest2';
import { stadiumLevel } from './15-stadium';
import { prisonLevel } from './16-prison';
import { hotelLevel } from './17-hotel';
import { islandLevel } from './18-island';
import { lighthouseLevel } from './19-lighthouse';
import { trainLevel } from './20-train';
import { medievalLevel } from './21-medieval';
import { amusementParkLevel } from './22-amusementpark';
import { airportLevel } from './23-airport';
import { zooLevel } from './24-zoo';
import { hollywoodLevel } from './25-hollywood';
import { streetLevel } from './26-street';
import { giantHouseLevel } from './27-gianthouse';
import { skiHotelLevel } from './28-skihotel';
import { circusLevel } from './29-circus';
import { dinerLevel } from './30-diner';
import { polarLevel } from './31-polar';
import { piratesLevel } from './32-pirates';
import { racingLevel } from './33-racing';
import { casinoLevel } from './34-casino';
import { parkingLevel } from './35-parking';
import { festivalLevel } from './36-festival';
import { bowlingLevel } from './37-bowling';
import { parkMazeLevel } from './38-parkmaze';
import { mineLevel } from './39-mine';
import { fightClubLevel } from './40-fightclub';
import { chemLabLevel } from './41-chemlab';
import { heavyCaseLevel } from './42-heavy';
import { baniaLevel } from './43-bania';
import { cemeteryLevel } from './44-cemetery';

export const levels: Level[] = [
  tutorialLevel,
  apartmentLevel,
  shopLevel,
  museumLevel,
  parkLevel,
  wildwestLevel,
  wizardSchoolLevel,
  officeLevel,
  mallLevel,
  forestLevel,
  stationLevel,
  egyptLevel,
  spaceLevel,
  hospitalLevel,
  wildwest2Level,
  stadiumLevel,
  prisonLevel,
  hotelLevel,
  islandLevel,
  lighthouseLevel,
  trainLevel,
  medievalLevel,
  amusementParkLevel,
  airportLevel,
  zooLevel,
  hollywoodLevel,
  streetLevel,
  giantHouseLevel,
  skiHotelLevel,
  circusLevel,
  dinerLevel,
  polarLevel,
  piratesLevel,
  racingLevel,
  casinoLevel,
  parkingLevel,
  festivalLevel,
  bowlingLevel,
  parkMazeLevel,
  mineLevel,
  fightClubLevel,
  chemLabLevel,
  heavyCaseLevel,
  baniaLevel,
  cemeteryLevel,
];

/** All non-tutorial levels — used by the level menu grid, size filters, profile stats and
 *  leaderboards. The tutorial level lives outside the common categorization (see LevelMeta.isTutorial). */
export const gameLevels: Level[] = levels.filter((level) => !level.meta.isTutorial);
