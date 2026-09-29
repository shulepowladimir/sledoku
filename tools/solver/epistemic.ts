import type { Level, PersonId } from '../../src/types/level';
import { solveLevel } from './solve';

export type EpistemicStatus = ReturnType<typeof solveLevel>['status'];

export interface EpistemicWorldResult {
  roleHolderId: PersonId;
  murdererId: PersonId;
  status: EpistemicStatus;
  reason?: string;
}

export interface EpistemicReport {
  baseline: EpistemicStatus;
  worlds: EpistemicWorldResult[];
}

export interface HiddenVictimWorldResult {
  victimId: PersonId;
  murdererId: PersonId;
  status: EpistemicStatus;
  reason?: string;
}

export interface HiddenVictimEpistemicReport {
  baseline: EpistemicStatus;
  worlds: HiddenVictimWorldResult[];
}

export interface MurdererWorldResult {
  murdererId: PersonId;
  status: EpistemicStatus;
  reason?: string;
}

export interface MurdererEpistemicReport {
  baseline: EpistemicStatus;
  worlds: MurdererWorldResult[];
}

export function createEpistemicWorld(
  level: Level,
  roleId: string,
  roleHolderId: PersonId,
  murdererId: PersonId,
): Level {
  const holders = level.people.filter((person) => person.roles?.includes(roleId));
  if (holders.length !== 1) {
    throw new Error(`Expected exactly one authored holder of role "${roleId}", found ${holders.length}.`);
  }

  const roleHolder = level.people.find((person) => person.id === roleHolderId);
  const murderer = level.people.find((person) => person.id === murdererId);
  if (!roleHolder) throw new Error(`Unknown role-holder candidate "${roleHolderId}".`);
  if (!murderer) throw new Error(`Unknown murderer candidate "${murdererId}".`);
  if (murderer.isVictim) throw new Error('The victim cannot be used as a murderer candidate.');

  return {
    ...level,
    people: level.people.map((person) => {
      const roles = (person.roles ?? []).filter((role) => role !== roleId);
      if (person.id === roleHolderId) roles.push(roleId);
      return {
        ...person,
        roles,
        isMurderer: person.id === murdererId,
      };
    }),
  };
}

export function checkHiddenRoleEpistemics(level: Level, roleId: string, candidateIds: PersonId[]): EpistemicReport {
  const currentHolders = level.people.filter((person) => person.roles?.includes(roleId));
  if (currentHolders.length !== 1) {
    throw new Error(`Expected exactly one authored holder of role "${roleId}", found ${currentHolders.length}.`);
  }
  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error('Role-holder candidates must not contain duplicate ids.');
  }

  const currentHolderId = currentHolders[0].id;
  const currentMurderers = level.people.filter((person) => person.isMurderer);
  if (currentMurderers.length !== 1) {
    throw new Error(`Expected exactly one authored murderer, found ${currentMurderers.length}.`);
  }
  if (!candidateIds.includes(currentHolderId)) {
    throw new Error(`Role-holder candidates must include the authored holder "${currentHolderId}".`);
  }
  for (const candidateId of candidateIds) {
    if (!level.people.some((person) => person.id === candidateId)) {
      throw new Error(`Unknown role-holder candidate "${candidateId}".`);
    }
  }

  const baseline = solveLevel(level).status;
  const worlds: EpistemicWorldResult[] = [];
  const murdererIds = level.people.filter((person) => !person.isVictim).map((person) => person.id);
  const currentMurdererId = currentMurderers[0].id;

  for (const roleHolderId of candidateIds) {
    for (const murdererId of murdererIds) {
      if (roleHolderId === currentHolderId && murdererId === currentMurdererId) continue;
      const result = solveLevel(createEpistemicWorld(level, roleId, roleHolderId, murdererId));
      worlds.push({
        roleHolderId,
        murdererId,
        status: result.status,
        ...(result.status === 'INCONCLUSIVE' ? { reason: result.reason } : {}),
      });
    }
  }

  return { baseline, worlds };
}

export function createHiddenVictimWorld(level: Level, victimId: PersonId, murdererId: PersonId): Level {
  const victims = level.people.filter((person) => person.isVictim);
  if (victims.length !== 1) {
    throw new Error(`Expected exactly one authored victim, found ${victims.length}.`);
  }

  const victim = level.people.find((person) => person.id === victimId);
  const murderer = level.people.find((person) => person.id === murdererId);
  if (!victim) throw new Error(`Unknown victim candidate "${victimId}".`);
  if (!murderer) throw new Error(`Unknown murderer candidate "${murdererId}".`);
  if (victimId === murdererId) throw new Error('The victim cannot also be the murderer.');

  return {
    ...level,
    people: level.people.map((person) => ({
      ...person,
      isVictim: person.id === victimId,
      isMurderer: person.id === murdererId,
    })),
  };
}

export function createMurdererWorld(level: Level, murdererId: PersonId): Level {
  const victims = level.people.filter((person) => person.isVictim);
  if (victims.length !== 1) {
    throw new Error(`Expected exactly one victim, found ${victims.length}.`);
  }

  const murderer = level.people.find((person) => person.id === murdererId);
  if (!murderer) throw new Error(`Unknown murderer candidate "${murdererId}".`);
  if (murderer.isVictim) throw new Error('The victim cannot be used as a murderer candidate.');

  return {
    ...level,
    people: level.people.map((person) => ({
      ...person,
      isMurderer: person.id === murdererId,
    })),
  };
}

export function checkMurdererEpistemics(level: Level): MurdererEpistemicReport {
  const victims = level.people.filter((person) => person.isVictim);
  if (victims.length !== 1) {
    throw new Error(`Expected exactly one victim, found ${victims.length}.`);
  }
  const murderers = level.people.filter((person) => person.isMurderer);
  if (murderers.length !== 1) {
    throw new Error(`Expected exactly one authored murderer, found ${murderers.length}.`);
  }

  const authoredMurdererId = murderers[0].id;
  const worlds = level.people
    .filter((person) => !person.isVictim && person.id !== authoredMurdererId)
    .map((person) => {
      const result = solveLevel(createMurdererWorld(level, person.id));
      return {
        murdererId: person.id,
        status: result.status,
        ...(result.status === 'INCONCLUSIVE' ? { reason: result.reason } : {}),
      };
    });

  return { baseline: solveLevel(level).status, worlds };
}

export function checkHiddenVictimEpistemics(level: Level, candidateIds: PersonId[]): HiddenVictimEpistemicReport {
  if (!level.meta.victimIdentityHidden) {
    throw new Error('Hidden-victim epistemics require meta.victimIdentityHidden.');
  }
  const victims = level.people.filter((person) => person.isVictim);
  const murderers = level.people.filter((person) => person.isMurderer);
  if (victims.length !== 1) throw new Error(`Expected exactly one authored victim, found ${victims.length}.`);
  if (murderers.length !== 1) throw new Error(`Expected exactly one authored murderer, found ${murderers.length}.`);
  if (new Set(candidateIds).size !== candidateIds.length) {
    throw new Error('Victim candidates must not contain duplicate ids.');
  }

  const currentVictimId = victims[0].id;
  const currentMurdererId = murderers[0].id;
  if (!candidateIds.includes(currentVictimId)) {
    throw new Error(`Victim candidates must include the authored victim "${currentVictimId}".`);
  }
  for (const candidateId of candidateIds) {
    if (!level.people.some((person) => person.id === candidateId)) {
      throw new Error(`Unknown victim candidate "${candidateId}".`);
    }
  }

  const worlds: HiddenVictimWorldResult[] = [];
  for (const victimId of candidateIds) {
    for (const murderer of level.people) {
      if (murderer.id === victimId) continue;
      if (victimId === currentVictimId && murderer.id === currentMurdererId) continue;
      const result = solveLevel(createHiddenVictimWorld(level, victimId, murderer.id));
      worlds.push({
        victimId,
        murdererId: murderer.id,
        status: result.status,
        ...(result.status === 'INCONCLUSIVE' ? { reason: result.reason } : {}),
      });
    }
  }

  return { baseline: solveLevel(level).status, worlds };
}
