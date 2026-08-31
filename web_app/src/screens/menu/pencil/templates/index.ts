import type { PencilConfig } from '../index'
import type { PencilVariant } from '../variants'
import { pencilBakery } from './bakery'
import { pencilGarden } from './garden'
import { pencilMarket } from './market'
import { pencilEvening } from './evening'
import { pencilWorkshop } from './workshop'
import { pencilCheese } from './cheese'
import { pencilFlower } from './flower'
import { pencilFlowerSummer } from './flower-summer'
import { pencilFlowerWinter } from './flower-winter'
import { pencilFlowerSpring } from './flower-spring'
import { pencilWine } from './wine'
import { pencilCheeseAlternating } from './cheese-alternating'
import { pencilHardwareAlternating } from './hardware-alternating'
import { pencilHardwareWeekend } from './hardware-weekend'
import { pencilHardwareShelf } from './hardware-shelf'
import { pencilCasaRitual } from './casa-ritual'
import { pencilCasaBath } from './casa-bath'
import { pencilCasaSignature } from './casa-signature'
import { pencilCasaServices } from './casa-services'
import { pencilAutoDetail } from './auto-detail'
import { pencilBlushBloom } from './blush-bloom'
import { pencilNova } from './nova'
import { pencilBeardy } from './beardy'
import { pencilCalmSpa } from './calm-spa'
import { pencilUnionBarber } from './union-barber'
import { pencilStudioMono } from './studio-mono'
import { pencilBeautyIssue } from './beauty-issue'
import { pencilObsidianQuarterly } from './obsidian-quarterly'
import { pencilCafecitos } from './cafecitos'

/** Each visual template owns its configuration in this directory. */
export const PENCIL_TEMPLATE_CONFIG: Record<PencilVariant, PencilConfig> = {
  'pencil-bakery': pencilBakery,
  'pencil-garden': pencilGarden,
  'pencil-market': pencilMarket,
  'pencil-evening': pencilEvening,
  'pencil-workshop': pencilWorkshop,
  'pencil-cheese': pencilCheese,
  'pencil-flower': pencilFlower,
  'pencil-flower-summer': pencilFlowerSummer,
  'pencil-flower-winter': pencilFlowerWinter,
  'pencil-flower-spring': pencilFlowerSpring,
  'pencil-wine': pencilWine,
  'pencil-cheese-alternating': pencilCheeseAlternating,
  'pencil-hardware-alternating': pencilHardwareAlternating,
  'pencil-hardware-weekend': pencilHardwareWeekend,
  'pencil-hardware-shelf': pencilHardwareShelf,
  'pencil-casa-ritual': pencilCasaRitual,
  'pencil-casa-bath': pencilCasaBath,
  'pencil-casa-signature': pencilCasaSignature,
  'pencil-casa-services': pencilCasaServices,
  'pencil-auto-detail': pencilAutoDetail,
  'pencil-blush-bloom': pencilBlushBloom,
  'pencil-nova': pencilNova,
  'pencil-beardy': pencilBeardy,
  'pencil-calm-spa': pencilCalmSpa,
  'pencil-union-barber': pencilUnionBarber,
  'pencil-studio-mono': pencilStudioMono,
  'pencil-beauty-issue': pencilBeautyIssue,
  'pencil-obsidian-quarterly': pencilObsidianQuarterly,
  'pencil-cafecitos': pencilCafecitos,
}
