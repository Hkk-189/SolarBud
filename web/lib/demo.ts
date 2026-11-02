import {
  getAlertCurrent,
  getKpForecast,
  getKpObserved,
  getSolarWindLatest,
  getSolarWindWindow,
  getVerification,
  type AlertStatus,
  type ApiResult,
  type KpForecast,
  type KpPoint,
  type SolarWindPoint,
  type VerificationPoint,
} from "./api/client";
import { demoSnapshot } from "./demo-snapshot";

/** One recording of the live API (`ops/record_demo.py`), shown when the API is offline so the site still has something to show. */
export type DemoSnapshot = {
  recordedAt: string;
  kp: KpForecast;
  alert: AlertStatus;
  windLatest: SolarWindPoint;
  wind: SolarWindPoint[];
  observed: KpPoint[];
  verification: VerificationPoint[];
};

/** Live result, or the recording marked `demo` when the API did not answer. Server pages only: the /api proxies keep returning 503. */
export async function orDemo<T>(live: Promise<ApiResult<T>>, recording: T): Promise<ApiResult<T>> {
  const result = await live;

  return result.ok ? result : { ok: true, data: recording, demo: true };
}

export const isDemo = (...results: ApiResult<unknown>[]) => results.some((r) => r.ok && r.demo === true);

export const recordedAt = demoSnapshot.recordedAt;

export const demoKpForecast = () => orDemo(getKpForecast(), demoSnapshot.kp);

export const demoAlertCurrent = () => orDemo(getAlertCurrent(), demoSnapshot.alert);

export const demoSolarWindLatest = () => orDemo(getSolarWindLatest(), demoSnapshot.windLatest);

export const demoSolarWindWindow = (hours: number) => orDemo(getSolarWindWindow(hours), demoSnapshot.wind);

export const demoKpObserved = (hours: number) => orDemo(getKpObserved(hours), demoSnapshot.observed);

export const demoVerification = () => orDemo(getVerification(), demoSnapshot.verification);
