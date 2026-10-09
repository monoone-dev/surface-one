import {
  SoneStatDirective,
  SoneStatGroupDirective,
  SoneStatHintDirective,
  SoneStatLabelDirective,
  SoneStatValueDirective,
} from "./stat.directive";
import { SoneStatTrendComponent } from "./stat-trend.component";

export const SONE_STAT_PARTS = [
  SoneStatGroupDirective,
  SoneStatDirective,
  SoneStatLabelDirective,
  SoneStatValueDirective,
  SoneStatHintDirective,
  SoneStatTrendComponent,
] as const;
