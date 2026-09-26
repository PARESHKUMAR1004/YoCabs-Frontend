import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

interface Stamp {
  build?: string;
  commit?: string;
  builtAt?: string;
}

export interface BuildInfo {
  version: string;
  /** Rises with every commit; higher means newer. */
  build: string;
  commit: string;
  /** Where the running code came from: the installed APK, or an over-the-air update. */
  source: 'update' | 'installed' | 'development';
  channel: string | null;
  updateId: string | null;
}

/** What is running right now. After an over-the-air update these are the update's values. */
export function buildInfo(): BuildInfo {
  const extra = (Constants.expoConfig?.extra ?? {}) as Stamp;

  const source = __DEV__
    ? 'development'
    : Updates.isEmbeddedLaunch === false
      ? 'update'
      : 'installed';

  return {
    version: Constants.expoConfig?.version ?? '?',
    build: extra.build ?? '?',
    commit: extra.commit ?? '?',
    source,
    channel: Updates.channel ?? null,
    updateId: Updates.updateId ? Updates.updateId.slice(0, 8) : null,
  };
}

/** "Version 1.0.0 · Build 52" */
export function buildLabel(info: BuildInfo = buildInfo()): string {
  return `Version ${info.version} · Build ${info.build}`;
}

/** "a1b2c3d · over-the-air update 46be903c · preview" */
export function buildDetail(info: BuildInfo = buildInfo()): string {
  const origin =
    info.source === 'update'
      ? `update ${info.updateId ?? ''}`.trim()
      : info.source === 'development'
        ? 'development'
        : 'installed app';
  return [info.commit, origin, info.channel].filter(Boolean).join(' · ');
}
