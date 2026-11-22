import { FINOS, VYBES, AKAAR, DUE } from './flagship';
import { OnlyMeta, RELAY, STM, SYNDICATE } from './systems';
import { BUNK } from './builds';
import type { Project } from './types';

/** Tier 1: the four core projects (FIN-OS, VYBES LYNK, AkaarAI, DueClock). Everything else is secondary. */
export const CORE: Project[] = [FINOS, VYBES, AKAAR, DUE];
export const FLAGSHIP = CORE;
export const SYSTEMS: Project[] = [OnlyMeta, RELAY, STM, SYNDICATE];
export const BUILDS: Project[] = [BUNK];
export const SECONDARY: Project[] = [...SYSTEMS, ...BUILDS];
export const PROJECTS: Project[] = [...CORE, ...SECONDARY];
export const isCore = (p: Project) => p.kind === 'Core';
export const tierLabel = (p: Project) => (isCore(p) ? 'Core project' : `Secondary · ${p.kind}`);
export const bySlug = (s: string) => PROJECTS.find((p) => p.slug === s);
export * from './types';
