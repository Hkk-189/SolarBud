// Replay of the five held-out storms (`make backtest STORM=<id>`, dry run). The alert parameters were
// chosen on the 2022-24 validation block, never on these storms. Event times are UTC.
export type AlertKind = "warning" | "active" | "all_clear";

export interface Backtest {
  id: string;
  name: string;
  /** Held-out storm dates (`ml/configs/holdout.yaml`); the replay window around them is wider. */
  start: string;
  end: string;
  falseWarnings: number;
  events: { kind: AlertKind; at: string }[];
}

export const KIND_LABEL: Record<AlertKind, string> = { warning: "Warning", active: "Active", all_clear: "All clear" };

export const BACKTESTS: Backtest[] = [
  {
    id: "2003-10-halloween",
    name: "Halloween storms, October 2003",
    start: "2003-10-28",
    end: "2003-11-01",
    falseWarnings: 2,
    events: [
      { kind: "warning", at: "2003-10-26T21:05:00Z" },
      { kind: "all_clear", at: "2003-10-27T10:05:00Z" },
      { kind: "warning", at: "2003-10-28T03:05:00Z" },
      { kind: "active", at: "2003-10-28T06:00:00Z" },
      { kind: "warning", at: "2003-10-28T09:10:00Z" },
      { kind: "active", at: "2003-10-28T12:00:00Z" },
      { kind: "warning", at: "2003-10-28T15:10:00Z" },
      { kind: "active", at: "2003-10-29T03:00:00Z" },
      { kind: "all_clear", at: "2003-10-29T06:10:00Z" },
      { kind: "active", at: "2003-10-29T09:00:00Z" },
      { kind: "all_clear", at: "2003-10-31T21:10:00Z" },
      { kind: "active", at: "2003-11-01T03:00:00Z" },
      { kind: "all_clear", at: "2003-11-01T09:10:00Z" },
    ],
  },
  {
    id: "2015-03-stpatricks",
    name: "St Patrick's Day storm, March 2015",
    start: "2015-03-16",
    end: "2015-03-19",
    falseWarnings: 2,
    events: [
      { kind: "warning", at: "2015-03-16T02:35:00Z" },
      { kind: "all_clear", at: "2015-03-16T07:40:00Z" },
      { kind: "warning", at: "2015-03-17T05:10:00Z" },
      { kind: "active", at: "2015-03-17T06:00:00Z" },
      { kind: "all_clear", at: "2015-03-18T09:10:00Z" },
      { kind: "active", at: "2015-03-18T15:00:00Z" },
      { kind: "all_clear", at: "2015-03-19T03:10:00Z" },
      { kind: "warning", at: "2015-03-19T09:20:00Z" },
      { kind: "active", at: "2015-03-19T12:00:00Z" },
      { kind: "all_clear", at: "2015-03-19T15:10:00Z" },
      { kind: "active", at: "2015-03-20T03:00:00Z" },
      { kind: "all_clear", at: "2015-03-20T06:10:00Z" },
      { kind: "active", at: "2015-03-20T09:00:00Z" },
      { kind: "all_clear", at: "2015-03-20T12:10:00Z" },
      { kind: "warning", at: "2015-03-21T00:05:00Z" },
      { kind: "all_clear", at: "2015-03-21T02:25:00Z" },
    ],
  },
  {
    id: "2017-09",
    name: "September 2017",
    start: "2017-09-06",
    end: "2017-09-10",
    falseWarnings: 1,
    events: [
      { kind: "active", at: "2017-09-05T00:00:00Z" },
      { kind: "all_clear", at: "2017-09-05T03:10:00Z" },
      { kind: "warning", at: "2017-09-07T01:00:00Z" },
      { kind: "all_clear", at: "2017-09-07T14:10:00Z" },
      { kind: "warning", at: "2017-09-07T21:20:00Z" },
      { kind: "active", at: "2017-09-08T00:00:00Z" },
      { kind: "warning", at: "2017-09-08T09:10:00Z" },
      { kind: "active", at: "2017-09-08T12:00:00Z" },
      { kind: "all_clear", at: "2017-09-09T03:10:00Z" },
      { kind: "warning", at: "2017-09-12T20:30:00Z" },
      { kind: "active", at: "2017-09-13T00:00:00Z" },
    ],
  },
  {
    id: "2024-05-gannon",
    name: "Gannon storm, May 2024",
    start: "2024-05-10",
    end: "2024-05-12",
    falseWarnings: 1,
    events: [
      { kind: "warning", at: "2024-05-10T17:15:00Z" },
      { kind: "active", at: "2024-05-10T18:00:00Z" },
      { kind: "all_clear", at: "2024-05-12T09:10:00Z" },
      { kind: "warning", at: "2024-05-12T19:30:00Z" },
      { kind: "active", at: "2024-05-13T00:00:00Z" },
      { kind: "warning", at: "2024-05-13T09:10:00Z" },
      { kind: "all_clear", at: "2024-05-13T14:55:00Z" },
    ],
  },
  {
    id: "2024-10",
    name: "October 2024",
    start: "2024-10-09",
    end: "2024-10-12",
    falseWarnings: 2,
    events: [
      { kind: "active", at: "2024-10-07T00:00:00Z" },
      { kind: "all_clear", at: "2024-10-07T09:10:00Z" },
      { kind: "active", at: "2024-10-07T12:00:00Z" },
      { kind: "warning", at: "2024-10-08T12:10:00Z" },
      { kind: "all_clear", at: "2024-10-09T03:10:00Z" },
      { kind: "warning", at: "2024-10-10T15:35:00Z" },
      { kind: "active", at: "2024-10-10T18:00:00Z" },
      { kind: "all_clear", at: "2024-10-11T18:10:00Z" },
      { kind: "warning", at: "2024-10-12T00:45:00Z" },
      { kind: "all_clear", at: "2024-10-12T03:05:00Z" },
      { kind: "active", at: "2024-10-12T12:00:00Z" },
      { kind: "all_clear", at: "2024-10-12T15:10:00Z" },
    ],
  },
];
