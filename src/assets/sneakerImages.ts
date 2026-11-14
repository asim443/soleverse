import sneakerChalkHigh from './images/sneaker_chalk_high_1794674259935.jpg';
import sneakerIvoryPlatform from './images/sneaker_ivory_platform_1794674261136.jpg';
import sneakerSilverMesh from './images/sneaker_silver_mesh_1794674261071.jpg';
import sneakerAshMonolith from './images/sneaker_ash_monolith_1794674262576.jpg';
import sneakerSlateVortex from './images/sneaker_slate_vortex_1794674262148.jpg';
import sneakerGraphiteApex from './images/sneaker_graphite_apex_1794674262987.jpg';
import sneakerEbonyDerby from './images/sneaker_ebony_derby_1794674263342.jpg';
import sneakerRoseQuartz from './images/sneaker_rose_quartz_1794674264342.jpg';
import sneakerPearlSuede from './images/sneaker_pearl_suede_1794674265036.jpg';
import sneakerCobaltHeel from './images/sneaker_cobalt_heel_1794674264677.jpg';
import sneakerSandstoneKnit from './images/sneaker_sandstone_knit_1794674268910.jpg';
import sneakerMidnightNavy from './images/sneaker_midnight_navy_1794674265881.jpg';
import sneakerObsidianShroud from './images/sneaker_obsidian_shroud_1794674265947.jpg';
import sneakerCopperArchive from './images/sneaker_copper_archive_1794674266373.jpg';
import sneakerTitaniumVelocity from './images/sneaker_titanium_velocity_1794674267028.jpg';
import sneakerCobaltSpeedfire from './images/sneaker_cobalt_speedfire_1794674267476.jpg';
import sneakerPlatinumElevate from './images/sneaker_platinum_elevate_1794674270315.jpg';
import sneakerEmeraldTennis from './images/sneaker_emerald_tennis_1794674268990.jpg';

import heroFlagshipEditorial from './images/hero_flagship_editorial_1794674269706.jpg';
import campaignMensDark from './images/campaign_mens_dark_1794674270610.jpg';
import campaignWomensAtelier from './images/campaign_womens_atelier_1794674270300.jpg';
import vaultShowcaseDark from './images/vault_showcase_dark_1794674270948.jpg';
import runningCarbonMacro from './images/running_carbon_macro_1794674271266.jpg';
import bannerAtelierCraft from './images/banner_atelier_craft_1794674272661.jpg';

export const SNEAKER_ASSET_MAP: Record<string, string> = {
  'asset:chalk_high': sneakerChalkHigh,
  'asset:ivory_platform': sneakerIvoryPlatform,
  'asset:silver_mesh': sneakerSilverMesh,
  'asset:ash_monolith': sneakerAshMonolith,
  'asset:slate_vortex': sneakerSlateVortex,
  'asset:graphite_apex': sneakerGraphiteApex,
  'asset:ebony_derby': sneakerEbonyDerby,
  'asset:rose_quartz': sneakerRoseQuartz,
  'asset:pearl_suede': sneakerPearlSuede,
  'asset:cobalt_heel': sneakerCobaltHeel,
  'asset:sandstone_knit': sneakerSandstoneKnit,
  'asset:midnight_navy': sneakerMidnightNavy,
  'asset:obsidian_shroud': sneakerObsidianShroud,
  'asset:copper_archive': sneakerCopperArchive,
  'asset:titanium_velocity': sneakerTitaniumVelocity,
  'asset:cobalt_speedfire': sneakerCobaltSpeedfire,
  'asset:platinum_elevate': sneakerPlatinumElevate,
  'asset:emerald_tennis': sneakerEmeraldTennis,
};

export const EDITORIAL_IMAGES = {
  heroFlagship: heroFlagshipEditorial,
  campaignMens: campaignMensDark,
  campaignWomens: campaignWomensAtelier,
  vaultShowcase: vaultShowcaseDark,
  runningMacro: runningCarbonMacro,
  atelierCraft: bannerAtelierCraft,
};

export function resolveProductImage(urlOrKey: string | null | undefined): string {
  if (!urlOrKey) return sneakerChalkHigh;
  if (urlOrKey in SNEAKER_ASSET_MAP) {
    return SNEAKER_ASSET_MAP[urlOrKey];
  }
  return urlOrKey;
}
