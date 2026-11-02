// Recorded by ops/record_demo.py from a live API. Regenerate with `python3 ops/record_demo.py`.
import type { DemoSnapshot } from "./demo";

export const demoSnapshot: DemoSnapshot = {
  "recordedAt": "2026-11-02T05:39:59Z",
  "kp": {
    "issued_at": "2026-11-02T05:39:59Z",
    "model_version": "stage2-lgbm-0.1.0",
    "data_stale": false,
    "horizons": [
      {
        "horizon_h": 1,
        "p10": 0.9565119259260584,
        "p50": 1.6488294534941377,
        "p90": 2.538285934598716
      },
      {
        "horizon_h": 3,
        "p10": 0.6515499892487556,
        "p50": 1.5416666930625307,
        "p90": 2.39782183642492
      },
      {
        "horizon_h": 6,
        "p10": 0.4324504154890164,
        "p50": 1.2606353513583979,
        "p90": 2.6016711698854817
      }
    ]
  },
  "alert": {
    "level": "all_clear",
    "since": "2026-10-11T13:09:08Z",
    "last_event": {
      "issued_at": "2026-10-11T13:09:08Z",
      "level": "all_clear",
      "p_exceed": 0.10261925963415719,
      "observed_kp": 3.0
    }
  },
  "windLatest": {
    "time": "2026-11-02T05:37:00Z",
    "source": "ACE",
    "density_cm3": 29.31,
    "speed_kms": 388.33,
    "bx_gsm_nt": 1.92,
    "by_gsm_nt": 0.3,
    "bz_gsm_nt": -1.05,
    "bt_nt": 2.21
  },
  "wind": [
    {
      "time": "2026-11-01T05:44:00Z",
      "source": "ACE",
      "density_cm3": 0.83,
      "speed_kms": 552.04,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T05:49:00Z",
      "source": "ACE",
      "density_cm3": 1.53,
      "speed_kms": 535.3,
      "bx_gsm_nt": 1.72,
      "by_gsm_nt": 4.25,
      "bz_gsm_nt": -2.77,
      "bt_nt": 5.36
    },
    {
      "time": "2026-11-01T05:54:00Z",
      "source": "ACE",
      "density_cm3": 1.2,
      "speed_kms": 557.92,
      "bx_gsm_nt": 2.36,
      "by_gsm_nt": 2.83,
      "bz_gsm_nt": -2.43,
      "bt_nt": 4.41
    },
    {
      "time": "2026-11-01T06:00:00Z",
      "source": "ACE",
      "density_cm3": 0.98,
      "speed_kms": 556.56,
      "bx_gsm_nt": 0.79,
      "by_gsm_nt": 3.64,
      "bz_gsm_nt": -2.92,
      "bt_nt": 4.73
    },
    {
      "time": "2026-11-01T06:05:00Z",
      "source": "ACE",
      "density_cm3": 2.11,
      "speed_kms": 513.17,
      "bx_gsm_nt": -2.56,
      "by_gsm_nt": -0.25,
      "bz_gsm_nt": -4.55,
      "bt_nt": 5.22
    },
    {
      "time": "2026-11-01T06:10:00Z",
      "source": "ACE",
      "density_cm3": 2.36,
      "speed_kms": 506.53,
      "bx_gsm_nt": -3.91,
      "by_gsm_nt": -0.05,
      "bz_gsm_nt": -3.57,
      "bt_nt": 5.29
    },
    {
      "time": "2026-11-01T06:15:00Z",
      "source": "ACE",
      "density_cm3": 2.15,
      "speed_kms": 483.13,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T06:20:00Z",
      "source": "ACE",
      "density_cm3": 2.39,
      "speed_kms": 500.56,
      "bx_gsm_nt": -4.14,
      "by_gsm_nt": -0.27,
      "bz_gsm_nt": -3.29,
      "bt_nt": 5.29
    },
    {
      "time": "2026-11-01T06:26:00Z",
      "source": "ACE",
      "density_cm3": 2.69,
      "speed_kms": 493.97,
      "bx_gsm_nt": -5.35,
      "by_gsm_nt": -0.94,
      "bz_gsm_nt": -1.11,
      "bt_nt": 5.54
    },
    {
      "time": "2026-11-01T06:32:00Z",
      "source": "ACE",
      "density_cm3": 1.51,
      "speed_kms": 472.38,
      "bx_gsm_nt": -5.27,
      "by_gsm_nt": -1.48,
      "bz_gsm_nt": -0.01,
      "bt_nt": 5.47
    },
    {
      "time": "2026-11-01T06:37:00Z",
      "source": "ACE",
      "density_cm3": 2.52,
      "speed_kms": 495.59,
      "bx_gsm_nt": -4.93,
      "by_gsm_nt": -1.33,
      "bz_gsm_nt": -1.49,
      "bt_nt": 5.32
    },
    {
      "time": "2026-11-01T06:43:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -5.39,
      "by_gsm_nt": -0.3,
      "bz_gsm_nt": -1.01,
      "bt_nt": 5.49
    },
    {
      "time": "2026-11-01T06:48:00Z",
      "source": "ACE",
      "density_cm3": 2.28,
      "speed_kms": 485.59,
      "bx_gsm_nt": -5.19,
      "by_gsm_nt": -0.85,
      "bz_gsm_nt": -1.78,
      "bt_nt": 5.55
    },
    {
      "time": "2026-11-01T06:53:00Z",
      "source": "ACE",
      "density_cm3": 4.18,
      "speed_kms": 493.02,
      "bx_gsm_nt": -4.6,
      "by_gsm_nt": -2.77,
      "bz_gsm_nt": -1.25,
      "bt_nt": 5.51
    },
    {
      "time": "2026-11-01T06:58:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -4.4,
      "by_gsm_nt": -1.95,
      "bz_gsm_nt": -1.76,
      "bt_nt": 5.13
    },
    {
      "time": "2026-11-01T07:04:00Z",
      "source": "ACE",
      "density_cm3": 1.64,
      "speed_kms": 472.11,
      "bx_gsm_nt": -5.12,
      "by_gsm_nt": -0.64,
      "bz_gsm_nt": -1.13,
      "bt_nt": 5.28
    },
    {
      "time": "2026-11-01T07:09:00Z",
      "source": "ACE",
      "density_cm3": 2.79,
      "speed_kms": 481.96,
      "bx_gsm_nt": -4.68,
      "by_gsm_nt": -0.4,
      "bz_gsm_nt": -2.77,
      "bt_nt": 5.45
    },
    {
      "time": "2026-11-01T07:14:00Z",
      "source": "ACE",
      "density_cm3": 3.69,
      "speed_kms": 525.18,
      "bx_gsm_nt": -4.68,
      "by_gsm_nt": -0.45,
      "bz_gsm_nt": -2.61,
      "bt_nt": 5.37
    },
    {
      "time": "2026-11-01T07:19:00Z",
      "source": "ACE",
      "density_cm3": 2.44,
      "speed_kms": 480.4,
      "bx_gsm_nt": -4.43,
      "by_gsm_nt": 0.09,
      "bz_gsm_nt": -3.34,
      "bt_nt": 5.55
    },
    {
      "time": "2026-11-01T07:25:00Z",
      "source": "ACE",
      "density_cm3": 1.81,
      "speed_kms": 481.23,
      "bx_gsm_nt": -3.53,
      "by_gsm_nt": -0.4,
      "bz_gsm_nt": -4.03,
      "bt_nt": 5.37
    },
    {
      "time": "2026-11-01T07:32:00Z",
      "source": "ACE",
      "density_cm3": 2.65,
      "speed_kms": 491.41,
      "bx_gsm_nt": -3.83,
      "by_gsm_nt": -1.71,
      "bz_gsm_nt": -3.74,
      "bt_nt": 5.62
    },
    {
      "time": "2026-11-01T07:37:00Z",
      "source": "ACE",
      "density_cm3": 1.99,
      "speed_kms": 508.55,
      "bx_gsm_nt": -0.49,
      "by_gsm_nt": 0.11,
      "bz_gsm_nt": -5.47,
      "bt_nt": 5.5
    },
    {
      "time": "2026-11-01T07:42:00Z",
      "source": "ACE",
      "density_cm3": 2.22,
      "speed_kms": 501.18,
      "bx_gsm_nt": -1.98,
      "by_gsm_nt": -2.07,
      "bz_gsm_nt": -4.84,
      "bt_nt": 5.62
    },
    {
      "time": "2026-11-01T07:48:00Z",
      "source": "ACE",
      "density_cm3": 5.04,
      "speed_kms": 507.01,
      "bx_gsm_nt": -2.78,
      "by_gsm_nt": -2.85,
      "bz_gsm_nt": -3.61,
      "bt_nt": 5.38
    },
    {
      "time": "2026-11-01T07:53:00Z",
      "source": "ACE",
      "density_cm3": 1.93,
      "speed_kms": 487.81,
      "bx_gsm_nt": -2.41,
      "by_gsm_nt": -0.34,
      "bz_gsm_nt": -5.06,
      "bt_nt": 5.61
    },
    {
      "time": "2026-11-01T07:58:00Z",
      "source": "ACE",
      "density_cm3": 2.11,
      "speed_kms": 489.3,
      "bx_gsm_nt": -2.58,
      "by_gsm_nt": -0.7,
      "bz_gsm_nt": -4.85,
      "bt_nt": 5.53
    },
    {
      "time": "2026-11-01T08:04:00Z",
      "source": "ACE",
      "density_cm3": 1.28,
      "speed_kms": 497.53,
      "bx_gsm_nt": -1.49,
      "by_gsm_nt": 0.81,
      "bz_gsm_nt": -5.07,
      "bt_nt": 5.34
    },
    {
      "time": "2026-11-01T08:09:00Z",
      "source": "ACE",
      "density_cm3": 2.44,
      "speed_kms": 495.56,
      "bx_gsm_nt": -3.7,
      "by_gsm_nt": -1.39,
      "bz_gsm_nt": -3.91,
      "bt_nt": 5.56
    },
    {
      "time": "2026-11-01T08:15:00Z",
      "source": "ACE",
      "density_cm3": 1.73,
      "speed_kms": 478.55,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T08:20:00Z",
      "source": "ACE",
      "density_cm3": 2.78,
      "speed_kms": 502.79,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T08:25:00Z",
      "source": "ACE",
      "density_cm3": 2.58,
      "speed_kms": 523.01,
      "bx_gsm_nt": -1.89,
      "by_gsm_nt": -2.27,
      "bz_gsm_nt": -4.42,
      "bt_nt": 5.32
    },
    {
      "time": "2026-11-01T08:32:00Z",
      "source": "ACE",
      "density_cm3": 1.57,
      "speed_kms": 478.91,
      "bx_gsm_nt": -3.17,
      "by_gsm_nt": -0.96,
      "bz_gsm_nt": -4.65,
      "bt_nt": 5.71
    },
    {
      "time": "2026-11-01T08:38:00Z",
      "source": "ACE",
      "density_cm3": 2.01,
      "speed_kms": 513.94,
      "bx_gsm_nt": -2.59,
      "by_gsm_nt": -1.14,
      "bz_gsm_nt": -4.48,
      "bt_nt": 5.3
    },
    {
      "time": "2026-11-01T08:43:00Z",
      "source": "ACE",
      "density_cm3": 1.84,
      "speed_kms": 498.42,
      "bx_gsm_nt": -1.71,
      "by_gsm_nt": -0.81,
      "bz_gsm_nt": -5.15,
      "bt_nt": 5.49
    },
    {
      "time": "2026-11-01T08:49:00Z",
      "source": "ACE",
      "density_cm3": 1.9,
      "speed_kms": 525.37,
      "bx_gsm_nt": -0.04,
      "by_gsm_nt": -1.54,
      "bz_gsm_nt": -4.92,
      "bt_nt": 5.15
    },
    {
      "time": "2026-11-01T08:54:00Z",
      "source": "ACE",
      "density_cm3": 2.26,
      "speed_kms": 487.37,
      "bx_gsm_nt": -3.11,
      "by_gsm_nt": -1.59,
      "bz_gsm_nt": -4.4,
      "bt_nt": 5.62
    },
    {
      "time": "2026-11-01T08:59:00Z",
      "source": "ACE",
      "density_cm3": 1.89,
      "speed_kms": 480.1,
      "bx_gsm_nt": -2.27,
      "by_gsm_nt": -2.97,
      "bz_gsm_nt": -4.05,
      "bt_nt": 5.51
    },
    {
      "time": "2026-11-01T09:05:00Z",
      "source": "ACE",
      "density_cm3": 1.89,
      "speed_kms": 487.7,
      "bx_gsm_nt": -3.2,
      "by_gsm_nt": -2.23,
      "bz_gsm_nt": -3.21,
      "bt_nt": 5.05
    },
    {
      "time": "2026-11-01T09:10:00Z",
      "source": "ACE",
      "density_cm3": 1.21,
      "speed_kms": 511.84,
      "bx_gsm_nt": -1.28,
      "by_gsm_nt": -1.91,
      "bz_gsm_nt": -4.31,
      "bt_nt": 4.88
    },
    {
      "time": "2026-11-01T09:15:00Z",
      "source": "ACE",
      "density_cm3": 1.79,
      "speed_kms": 511.54,
      "bx_gsm_nt": -1.93,
      "by_gsm_nt": -2.5,
      "bz_gsm_nt": -3.9,
      "bt_nt": 5.02
    },
    {
      "time": "2026-11-01T09:20:00Z",
      "source": "ACE",
      "density_cm3": 0.69,
      "speed_kms": 486.01,
      "bx_gsm_nt": -2.2,
      "by_gsm_nt": -2.39,
      "bz_gsm_nt": -3.94,
      "bt_nt": 5.1
    },
    {
      "time": "2026-11-01T09:25:00Z",
      "source": "ACE",
      "density_cm3": 2.26,
      "speed_kms": 501.87,
      "bx_gsm_nt": -2.56,
      "by_gsm_nt": -2.94,
      "bz_gsm_nt": -3.24,
      "bt_nt": 5.07
    },
    {
      "time": "2026-11-01T09:30:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -3.34,
      "by_gsm_nt": -2.92,
      "bz_gsm_nt": -2.73,
      "bt_nt": 5.21
    },
    {
      "time": "2026-11-01T09:36:00Z",
      "source": "ACE",
      "density_cm3": 1.24,
      "speed_kms": 485.85,
      "bx_gsm_nt": -3.77,
      "by_gsm_nt": -2.6,
      "bz_gsm_nt": -2.72,
      "bt_nt": 5.33
    },
    {
      "time": "2026-11-01T09:41:00Z",
      "source": "ACE",
      "density_cm3": 1.01,
      "speed_kms": 476.01,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T09:46:00Z",
      "source": "ACE",
      "density_cm3": 2.42,
      "speed_kms": 498.3,
      "bx_gsm_nt": -3.49,
      "by_gsm_nt": -3.17,
      "bz_gsm_nt": -2.26,
      "bt_nt": 5.23
    },
    {
      "time": "2026-11-01T09:51:00Z",
      "source": "ACE",
      "density_cm3": 1.49,
      "speed_kms": 491.41,
      "bx_gsm_nt": -3.73,
      "by_gsm_nt": -2.75,
      "bz_gsm_nt": -2.24,
      "bt_nt": 5.15
    },
    {
      "time": "2026-11-01T09:56:00Z",
      "source": "ACE",
      "density_cm3": 2.21,
      "speed_kms": 494.05,
      "bx_gsm_nt": -3.94,
      "by_gsm_nt": -2.81,
      "bz_gsm_nt": -1.91,
      "bt_nt": 5.21
    },
    {
      "time": "2026-11-01T10:03:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -3.72,
      "by_gsm_nt": -2.71,
      "bz_gsm_nt": -2.0,
      "bt_nt": 5.01
    },
    {
      "time": "2026-11-01T10:08:00Z",
      "source": "ACE",
      "density_cm3": 1.73,
      "speed_kms": 494.19,
      "bx_gsm_nt": -2.19,
      "by_gsm_nt": -3.93,
      "bz_gsm_nt": -1.07,
      "bt_nt": 4.63
    },
    {
      "time": "2026-11-01T10:14:00Z",
      "source": "ACE",
      "density_cm3": 1.73,
      "speed_kms": 513.83,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T10:19:00Z",
      "source": "ACE",
      "density_cm3": 1.83,
      "speed_kms": 492.97,
      "bx_gsm_nt": -0.39,
      "by_gsm_nt": -1.96,
      "bz_gsm_nt": -0.59,
      "bt_nt": 2.08
    },
    {
      "time": "2026-11-01T10:25:00Z",
      "source": "ACE",
      "density_cm3": 1.39,
      "speed_kms": 520.83,
      "bx_gsm_nt": 0.97,
      "by_gsm_nt": -3.67,
      "bz_gsm_nt": 0.62,
      "bt_nt": 3.85
    },
    {
      "time": "2026-11-01T10:30:00Z",
      "source": "ACE",
      "density_cm3": 1.52,
      "speed_kms": 501.11,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T10:35:00Z",
      "source": "ACE",
      "density_cm3": 1.53,
      "speed_kms": 513.97,
      "bx_gsm_nt": 1.79,
      "by_gsm_nt": -2.79,
      "bz_gsm_nt": 0.8,
      "bt_nt": 3.41
    },
    {
      "time": "2026-11-01T10:41:00Z",
      "source": "ACE",
      "density_cm3": 1.71,
      "speed_kms": 508.72,
      "bx_gsm_nt": 1.02,
      "by_gsm_nt": -2.29,
      "bz_gsm_nt": 2.29,
      "bt_nt": 3.4
    },
    {
      "time": "2026-11-01T10:46:00Z",
      "source": "ACE",
      "density_cm3": 1.45,
      "speed_kms": 513.41,
      "bx_gsm_nt": 0.58,
      "by_gsm_nt": -1.51,
      "bz_gsm_nt": 2.48,
      "bt_nt": 2.96
    },
    {
      "time": "2026-11-01T10:51:00Z",
      "source": "ACE",
      "density_cm3": 2.14,
      "speed_kms": 514.72,
      "bx_gsm_nt": -0.96,
      "by_gsm_nt": 2.48,
      "bz_gsm_nt": -1.6,
      "bt_nt": 3.1
    },
    {
      "time": "2026-11-01T10:56:00Z",
      "source": "ACE",
      "density_cm3": 0.84,
      "speed_kms": 482.65,
      "bx_gsm_nt": -1.37,
      "by_gsm_nt": 2.79,
      "bz_gsm_nt": -1.42,
      "bt_nt": 3.42
    },
    {
      "time": "2026-11-01T11:01:00Z",
      "source": "ACE",
      "density_cm3": 0.36,
      "speed_kms": 484.26,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T11:06:00Z",
      "source": "ACE",
      "density_cm3": 0.57,
      "speed_kms": 489.1,
      "bx_gsm_nt": -0.62,
      "by_gsm_nt": 2.77,
      "bz_gsm_nt": -2.36,
      "bt_nt": 3.69
    },
    {
      "time": "2026-11-01T11:11:00Z",
      "source": "ACE",
      "density_cm3": 0.53,
      "speed_kms": 496.15,
      "bx_gsm_nt": -0.38,
      "by_gsm_nt": 2.96,
      "bz_gsm_nt": -1.83,
      "bt_nt": 3.5
    },
    {
      "time": "2026-11-01T11:16:00Z",
      "source": "ACE",
      "density_cm3": 0.84,
      "speed_kms": 511.75,
      "bx_gsm_nt": -0.36,
      "by_gsm_nt": 3.11,
      "bz_gsm_nt": -0.67,
      "bt_nt": 3.2
    },
    {
      "time": "2026-11-01T11:21:00Z",
      "source": "ACE",
      "density_cm3": 0.96,
      "speed_kms": 502.8,
      "bx_gsm_nt": 0.62,
      "by_gsm_nt": 1.94,
      "bz_gsm_nt": -2.11,
      "bt_nt": 2.93
    },
    {
      "time": "2026-11-01T11:26:00Z",
      "source": "ACE",
      "density_cm3": 1.71,
      "speed_kms": 519.53,
      "bx_gsm_nt": 1.05,
      "by_gsm_nt": 1.42,
      "bz_gsm_nt": -1.57,
      "bt_nt": 2.36
    },
    {
      "time": "2026-11-01T11:31:00Z",
      "source": "ACE",
      "density_cm3": 2.11,
      "speed_kms": 512.15,
      "bx_gsm_nt": 2.12,
      "by_gsm_nt": 0.28,
      "bz_gsm_nt": -2.2,
      "bt_nt": 3.07
    },
    {
      "time": "2026-11-01T11:36:00Z",
      "source": "ACE",
      "density_cm3": 1.54,
      "speed_kms": 511.68,
      "bx_gsm_nt": 1.1,
      "by_gsm_nt": 1.95,
      "bz_gsm_nt": -1.29,
      "bt_nt": 2.58
    },
    {
      "time": "2026-11-01T11:41:00Z",
      "source": "ACE",
      "density_cm3": 1.61,
      "speed_kms": 498.68,
      "bx_gsm_nt": 1.04,
      "by_gsm_nt": 1.71,
      "bz_gsm_nt": -1.48,
      "bt_nt": 2.49
    },
    {
      "time": "2026-11-01T11:47:00Z",
      "source": "ACE",
      "density_cm3": 2.17,
      "speed_kms": 510.49,
      "bx_gsm_nt": 2.08,
      "by_gsm_nt": -0.17,
      "bz_gsm_nt": -0.96,
      "bt_nt": 2.3
    },
    {
      "time": "2026-11-01T11:52:00Z",
      "source": "ACE",
      "density_cm3": 2.03,
      "speed_kms": 505.62,
      "bx_gsm_nt": 2.24,
      "by_gsm_nt": 0.19,
      "bz_gsm_nt": -0.97,
      "bt_nt": 2.45
    },
    {
      "time": "2026-11-01T12:00:00Z",
      "source": "ACE",
      "density_cm3": 2.22,
      "speed_kms": 503.23,
      "bx_gsm_nt": 2.38,
      "by_gsm_nt": -0.09,
      "bz_gsm_nt": -1.04,
      "bt_nt": 2.59
    },
    {
      "time": "2026-11-01T12:05:00Z",
      "source": "ACE",
      "density_cm3": 2.8,
      "speed_kms": 496.27,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T12:12:00Z",
      "source": "ACE",
      "density_cm3": 2.36,
      "speed_kms": 496.36,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T12:19:00Z",
      "source": "ACE",
      "density_cm3": 1.97,
      "speed_kms": 504.18,
      "bx_gsm_nt": 2.99,
      "by_gsm_nt": 0.56,
      "bz_gsm_nt": -1.57,
      "bt_nt": 3.42
    },
    {
      "time": "2026-11-01T12:25:00Z",
      "source": "ACE",
      "density_cm3": 2.32,
      "speed_kms": 497.17,
      "bx_gsm_nt": 1.44,
      "by_gsm_nt": 1.09,
      "bz_gsm_nt": -2.54,
      "bt_nt": 3.12
    },
    {
      "time": "2026-11-01T12:32:00Z",
      "source": "ACE",
      "density_cm3": 2.95,
      "speed_kms": 503.7,
      "bx_gsm_nt": 1.76,
      "by_gsm_nt": -2.02,
      "bz_gsm_nt": -0.33,
      "bt_nt": 2.7
    },
    {
      "time": "2026-11-01T12:39:00Z",
      "source": "ACE",
      "density_cm3": 3.05,
      "speed_kms": 481.97,
      "bx_gsm_nt": 0.31,
      "by_gsm_nt": -3.26,
      "bz_gsm_nt": -0.2,
      "bt_nt": 3.28
    },
    {
      "time": "2026-11-01T12:46:00Z",
      "source": "ACE",
      "density_cm3": 2.87,
      "speed_kms": 472.42,
      "bx_gsm_nt": -2.82,
      "by_gsm_nt": -0.83,
      "bz_gsm_nt": -2.3,
      "bt_nt": 3.73
    },
    {
      "time": "2026-11-01T12:51:00Z",
      "source": "ACE",
      "density_cm3": 3.48,
      "speed_kms": 493.89,
      "bx_gsm_nt": 0.18,
      "by_gsm_nt": -3.63,
      "bz_gsm_nt": 1.06,
      "bt_nt": 3.78
    },
    {
      "time": "2026-11-01T12:56:00Z",
      "source": "ACE",
      "density_cm3": 3.6,
      "speed_kms": 491.08,
      "bx_gsm_nt": 0.88,
      "by_gsm_nt": -3.65,
      "bz_gsm_nt": 0.46,
      "bt_nt": 3.78
    },
    {
      "time": "2026-11-01T13:03:00Z",
      "source": "ACE",
      "density_cm3": 2.87,
      "speed_kms": 483.61,
      "bx_gsm_nt": 1.6,
      "by_gsm_nt": -2.72,
      "bz_gsm_nt": -1.59,
      "bt_nt": 3.53
    },
    {
      "time": "2026-11-01T13:09:00Z",
      "source": "ACE",
      "density_cm3": 3.59,
      "speed_kms": 504.02,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T13:15:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 0.16,
      "by_gsm_nt": 3.96,
      "bz_gsm_nt": -2.71,
      "bt_nt": 4.8
    },
    {
      "time": "2026-11-01T13:21:00Z",
      "source": "ACE",
      "density_cm3": 1.58,
      "speed_kms": 485.51,
      "bx_gsm_nt": -0.35,
      "by_gsm_nt": 3.93,
      "bz_gsm_nt": -1.94,
      "bt_nt": 4.39
    },
    {
      "time": "2026-11-01T13:26:00Z",
      "source": "ACE",
      "density_cm3": 1.47,
      "speed_kms": 481.09,
      "bx_gsm_nt": -1.15,
      "by_gsm_nt": 4.05,
      "bz_gsm_nt": -1.36,
      "bt_nt": 4.43
    },
    {
      "time": "2026-11-01T13:32:00Z",
      "source": "ACE",
      "density_cm3": 1.39,
      "speed_kms": 477.03,
      "bx_gsm_nt": -1.7,
      "by_gsm_nt": 4.37,
      "bz_gsm_nt": -0.58,
      "bt_nt": 4.72
    },
    {
      "time": "2026-11-01T13:39:00Z",
      "source": "ACE",
      "density_cm3": 1.54,
      "speed_kms": 480.9,
      "bx_gsm_nt": -1.66,
      "by_gsm_nt": 4.42,
      "bz_gsm_nt": -0.84,
      "bt_nt": 4.79
    },
    {
      "time": "2026-11-01T13:45:00Z",
      "source": "ACE",
      "density_cm3": 1.41,
      "speed_kms": 478.63,
      "bx_gsm_nt": -1.26,
      "by_gsm_nt": 4.2,
      "bz_gsm_nt": -1.45,
      "bt_nt": 4.62
    },
    {
      "time": "2026-11-01T13:51:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -0.74,
      "by_gsm_nt": 3.52,
      "bz_gsm_nt": -1.96,
      "bt_nt": 4.1
    },
    {
      "time": "2026-11-01T13:56:00Z",
      "source": "ACE",
      "density_cm3": 1.44,
      "speed_kms": 478.81,
      "bx_gsm_nt": -1.71,
      "by_gsm_nt": 2.35,
      "bz_gsm_nt": -0.71,
      "bt_nt": 2.99
    },
    {
      "time": "2026-11-01T14:01:00Z",
      "source": "ACE",
      "density_cm3": 3.69,
      "speed_kms": 480.55,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T14:08:00Z",
      "source": "ACE",
      "density_cm3": 4.3,
      "speed_kms": 481.51,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T14:14:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -1.0,
      "by_gsm_nt": -3.98,
      "bz_gsm_nt": 2.71,
      "bt_nt": 4.91
    },
    {
      "time": "2026-11-01T14:20:00Z",
      "source": "ACE",
      "density_cm3": 3.34,
      "speed_kms": 476.22,
      "bx_gsm_nt": -0.03,
      "by_gsm_nt": -4.29,
      "bz_gsm_nt": 0.72,
      "bt_nt": 4.35
    },
    {
      "time": "2026-11-01T14:25:00Z",
      "source": "ACE",
      "density_cm3": 2.8,
      "speed_kms": 478.63,
      "bx_gsm_nt": -0.11,
      "by_gsm_nt": -3.48,
      "bz_gsm_nt": 0.28,
      "bt_nt": 3.49
    },
    {
      "time": "2026-11-01T14:31:00Z",
      "source": "ACE",
      "density_cm3": 3.04,
      "speed_kms": 477.23,
      "bx_gsm_nt": 0.28,
      "by_gsm_nt": -2.91,
      "bz_gsm_nt": -0.07,
      "bt_nt": 2.93
    },
    {
      "time": "2026-11-01T14:36:00Z",
      "source": "ACE",
      "density_cm3": 3.9,
      "speed_kms": 482.35,
      "bx_gsm_nt": 0.69,
      "by_gsm_nt": -3.73,
      "bz_gsm_nt": -0.01,
      "bt_nt": 3.79
    },
    {
      "time": "2026-11-01T14:43:00Z",
      "source": "ACE",
      "density_cm3": 3.02,
      "speed_kms": 484.07,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T14:48:00Z",
      "source": "ACE",
      "density_cm3": 3.59,
      "speed_kms": 478.8,
      "bx_gsm_nt": 0.81,
      "by_gsm_nt": -2.55,
      "bz_gsm_nt": -0.03,
      "bt_nt": 2.68
    },
    {
      "time": "2026-11-01T14:53:00Z",
      "source": "ACE",
      "density_cm3": 3.03,
      "speed_kms": 474.23,
      "bx_gsm_nt": 0.8,
      "by_gsm_nt": 0.97,
      "bz_gsm_nt": -2.91,
      "bt_nt": 3.17
    },
    {
      "time": "2026-11-01T14:59:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -3.57,
      "by_gsm_nt": 1.33,
      "bz_gsm_nt": 0.55,
      "bt_nt": 3.85
    },
    {
      "time": "2026-11-01T15:06:00Z",
      "source": "ACE",
      "density_cm3": 3.79,
      "speed_kms": 483.15,
      "bx_gsm_nt": -0.14,
      "by_gsm_nt": 1.55,
      "bz_gsm_nt": -3.3,
      "bt_nt": 3.65
    },
    {
      "time": "2026-11-01T15:11:00Z",
      "source": "ACE",
      "density_cm3": 2.82,
      "speed_kms": 476.73,
      "bx_gsm_nt": -1.85,
      "by_gsm_nt": 2.82,
      "bz_gsm_nt": -0.74,
      "bt_nt": 3.45
    },
    {
      "time": "2026-11-01T15:17:00Z",
      "source": "ACE",
      "density_cm3": 3.99,
      "speed_kms": 502.79,
      "bx_gsm_nt": 0.63,
      "by_gsm_nt": 3.84,
      "bz_gsm_nt": -2.02,
      "bt_nt": 4.39
    },
    {
      "time": "2026-11-01T15:22:00Z",
      "source": "ACE",
      "density_cm3": 3.22,
      "speed_kms": 476.16,
      "bx_gsm_nt": 1.38,
      "by_gsm_nt": 2.89,
      "bz_gsm_nt": -2.36,
      "bt_nt": 3.98
    },
    {
      "time": "2026-11-01T15:28:00Z",
      "source": "ACE",
      "density_cm3": 4.6,
      "speed_kms": 521.22,
      "bx_gsm_nt": 2.01,
      "by_gsm_nt": 1.8,
      "bz_gsm_nt": -2.93,
      "bt_nt": 3.98
    },
    {
      "time": "2026-11-01T15:33:00Z",
      "source": "ACE",
      "density_cm3": 3.8,
      "speed_kms": 469.14,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T15:38:00Z",
      "source": "ACE",
      "density_cm3": 4.22,
      "speed_kms": 475.94,
      "bx_gsm_nt": 0.97,
      "by_gsm_nt": -3.75,
      "bz_gsm_nt": -1.31,
      "bt_nt": 4.09
    },
    {
      "time": "2026-11-01T15:43:00Z",
      "source": "ACE",
      "density_cm3": 4.2,
      "speed_kms": 498.18,
      "bx_gsm_nt": 2.64,
      "by_gsm_nt": 3.14,
      "bz_gsm_nt": -2.48,
      "bt_nt": 4.79
    },
    {
      "time": "2026-11-01T15:48:00Z",
      "source": "ACE",
      "density_cm3": 2.81,
      "speed_kms": 459.41,
      "bx_gsm_nt": 2.42,
      "by_gsm_nt": 3.56,
      "bz_gsm_nt": -2.42,
      "bt_nt": 4.94
    },
    {
      "time": "2026-11-01T15:53:00Z",
      "source": "ACE",
      "density_cm3": 4.51,
      "speed_kms": 514.67,
      "bx_gsm_nt": 1.96,
      "by_gsm_nt": 3.37,
      "bz_gsm_nt": -2.49,
      "bt_nt": 4.62
    },
    {
      "time": "2026-11-01T16:02:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 2.81,
      "by_gsm_nt": 2.08,
      "bz_gsm_nt": -2.94,
      "bt_nt": 4.57
    },
    {
      "time": "2026-11-01T16:07:00Z",
      "source": "ACE",
      "density_cm3": 4.13,
      "speed_kms": 498.0,
      "bx_gsm_nt": 2.95,
      "by_gsm_nt": 1.05,
      "bz_gsm_nt": -3.12,
      "bt_nt": 4.42
    },
    {
      "time": "2026-11-01T16:13:00Z",
      "source": "ACE",
      "density_cm3": 3.73,
      "speed_kms": 490.7,
      "bx_gsm_nt": 2.81,
      "by_gsm_nt": 0.98,
      "bz_gsm_nt": -3.34,
      "bt_nt": 4.47
    },
    {
      "time": "2026-11-01T16:19:00Z",
      "source": "ACE",
      "density_cm3": 3.56,
      "speed_kms": 488.23,
      "bx_gsm_nt": 3.35,
      "by_gsm_nt": 0.61,
      "bz_gsm_nt": -3.64,
      "bt_nt": 4.98
    },
    {
      "time": "2026-11-01T16:25:00Z",
      "source": "ACE",
      "density_cm3": 3.33,
      "speed_kms": 488.4,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T16:32:00Z",
      "source": "ACE",
      "density_cm3": 3.88,
      "speed_kms": 507.07,
      "bx_gsm_nt": 2.74,
      "by_gsm_nt": -1.96,
      "bz_gsm_nt": -3.67,
      "bt_nt": 4.98
    },
    {
      "time": "2026-11-01T16:39:00Z",
      "source": "ACE",
      "density_cm3": 3.52,
      "speed_kms": 485.84,
      "bx_gsm_nt": 1.5,
      "by_gsm_nt": -2.93,
      "bz_gsm_nt": -2.96,
      "bt_nt": 4.42
    },
    {
      "time": "2026-11-01T16:45:00Z",
      "source": "ACE",
      "density_cm3": 4.26,
      "speed_kms": 466.14,
      "bx_gsm_nt": 1.56,
      "by_gsm_nt": -1.27,
      "bz_gsm_nt": -2.68,
      "bt_nt": 3.35
    },
    {
      "time": "2026-11-01T16:52:00Z",
      "source": "ACE",
      "density_cm3": 3.75,
      "speed_kms": 485.82,
      "bx_gsm_nt": 1.47,
      "by_gsm_nt": -2.92,
      "bz_gsm_nt": -3.79,
      "bt_nt": 5.0
    },
    {
      "time": "2026-11-01T16:57:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 1.81,
      "by_gsm_nt": -3.89,
      "bz_gsm_nt": -2.83,
      "bt_nt": 5.14
    },
    {
      "time": "2026-11-01T17:04:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 0.38,
      "by_gsm_nt": -5.0,
      "bz_gsm_nt": -2.24,
      "bt_nt": 5.49
    },
    {
      "time": "2026-11-01T17:11:00Z",
      "source": "ACE",
      "density_cm3": 4.45,
      "speed_kms": 494.05,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T17:18:00Z",
      "source": "ACE",
      "density_cm3": 3.61,
      "speed_kms": 489.1,
      "bx_gsm_nt": -0.49,
      "by_gsm_nt": -2.54,
      "bz_gsm_nt": -1.03,
      "bt_nt": 2.78
    },
    {
      "time": "2026-11-01T17:25:00Z",
      "source": "ACE",
      "density_cm3": 2.87,
      "speed_kms": 482.0,
      "bx_gsm_nt": -4.21,
      "by_gsm_nt": 2.84,
      "bz_gsm_nt": 1.01,
      "bt_nt": 5.18
    },
    {
      "time": "2026-11-01T17:31:00Z",
      "source": "ACE",
      "density_cm3": 2.68,
      "speed_kms": 479.16,
      "bx_gsm_nt": 2.99,
      "by_gsm_nt": -1.88,
      "bz_gsm_nt": -2.1,
      "bt_nt": 4.11
    },
    {
      "time": "2026-11-01T17:38:00Z",
      "source": "ACE",
      "density_cm3": 1.91,
      "speed_kms": 482.79,
      "bx_gsm_nt": -4.29,
      "by_gsm_nt": -0.11,
      "bz_gsm_nt": 2.09,
      "bt_nt": 4.77
    },
    {
      "time": "2026-11-01T17:44:00Z",
      "source": "ACE",
      "density_cm3": 1.96,
      "speed_kms": 483.22,
      "bx_gsm_nt": -4.39,
      "by_gsm_nt": -1.59,
      "bz_gsm_nt": 1.31,
      "bt_nt": 4.85
    },
    {
      "time": "2026-11-01T17:50:00Z",
      "source": "ACE",
      "density_cm3": 0.63,
      "speed_kms": 438.97,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T17:56:00Z",
      "source": "ACE",
      "density_cm3": 1.47,
      "speed_kms": 459.52,
      "bx_gsm_nt": -4.65,
      "by_gsm_nt": -1.05,
      "bz_gsm_nt": 0.22,
      "bt_nt": 4.77
    },
    {
      "time": "2026-11-01T18:02:00Z",
      "source": "ACE",
      "density_cm3": 0.96,
      "speed_kms": 483.25,
      "bx_gsm_nt": -1.62,
      "by_gsm_nt": -0.83,
      "bz_gsm_nt": 3.64,
      "bt_nt": 4.07
    },
    {
      "time": "2026-11-01T18:07:00Z",
      "source": "ACE",
      "density_cm3": 1.42,
      "speed_kms": 479.28,
      "bx_gsm_nt": -2.74,
      "by_gsm_nt": -2.51,
      "bz_gsm_nt": 1.68,
      "bt_nt": 4.07
    },
    {
      "time": "2026-11-01T18:13:00Z",
      "source": "ACE",
      "density_cm3": 1.53,
      "speed_kms": 480.12,
      "bx_gsm_nt": -4.18,
      "by_gsm_nt": 0.23,
      "bz_gsm_nt": 1.55,
      "bt_nt": 4.47
    },
    {
      "time": "2026-11-01T18:19:00Z",
      "source": "ACE",
      "density_cm3": 1.86,
      "speed_kms": 477.4,
      "bx_gsm_nt": -1.09,
      "by_gsm_nt": -2.81,
      "bz_gsm_nt": 1.46,
      "bt_nt": 3.35
    },
    {
      "time": "2026-11-01T18:25:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 0.26,
      "by_gsm_nt": -2.29,
      "bz_gsm_nt": -0.88,
      "bt_nt": 2.46
    },
    {
      "time": "2026-11-01T18:30:00Z",
      "source": "ACE",
      "density_cm3": 1.7,
      "speed_kms": 509.1,
      "bx_gsm_nt": 2.28,
      "by_gsm_nt": -1.87,
      "bz_gsm_nt": -3.67,
      "bt_nt": 4.7
    },
    {
      "time": "2026-11-01T18:37:00Z",
      "source": "ACE",
      "density_cm3": 1.51,
      "speed_kms": 493.45,
      "bx_gsm_nt": 1.14,
      "by_gsm_nt": -2.41,
      "bz_gsm_nt": -1.27,
      "bt_nt": 2.95
    },
    {
      "time": "2026-11-01T18:43:00Z",
      "source": "ACE",
      "density_cm3": 1.8,
      "speed_kms": 514.76,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T18:49:00Z",
      "source": "ACE",
      "density_cm3": 1.16,
      "speed_kms": 477.0,
      "bx_gsm_nt": -0.62,
      "by_gsm_nt": -4.74,
      "bz_gsm_nt": 1.59,
      "bt_nt": 5.04
    },
    {
      "time": "2026-11-01T18:55:00Z",
      "source": "ACE",
      "density_cm3": 0.9,
      "speed_kms": 474.59,
      "bx_gsm_nt": -1.79,
      "by_gsm_nt": -4.32,
      "bz_gsm_nt": 1.73,
      "bt_nt": 4.99
    },
    {
      "time": "2026-11-01T19:02:00Z",
      "source": "ACE",
      "density_cm3": 1.31,
      "speed_kms": 486.28,
      "bx_gsm_nt": 1.21,
      "by_gsm_nt": -3.85,
      "bz_gsm_nt": -1.38,
      "bt_nt": 4.26
    },
    {
      "time": "2026-11-01T19:09:00Z",
      "source": "ACE",
      "density_cm3": 1.34,
      "speed_kms": 490.87,
      "bx_gsm_nt": 2.26,
      "by_gsm_nt": -3.37,
      "bz_gsm_nt": -1.62,
      "bt_nt": 4.37
    },
    {
      "time": "2026-11-01T19:14:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 1.51,
      "by_gsm_nt": -4.58,
      "bz_gsm_nt": -0.69,
      "bt_nt": 4.87
    },
    {
      "time": "2026-11-01T19:20:00Z",
      "source": "ACE",
      "density_cm3": 1.12,
      "speed_kms": 474.39,
      "bx_gsm_nt": -0.17,
      "by_gsm_nt": -4.51,
      "bz_gsm_nt": 0.66,
      "bt_nt": 4.56
    },
    {
      "time": "2026-11-01T19:26:00Z",
      "source": "ACE",
      "density_cm3": 1.42,
      "speed_kms": 488.15,
      "bx_gsm_nt": 1.43,
      "by_gsm_nt": -2.33,
      "bz_gsm_nt": -1.67,
      "bt_nt": 3.2
    },
    {
      "time": "2026-11-01T19:32:00Z",
      "source": "ACE",
      "density_cm3": 1.36,
      "speed_kms": 489.03,
      "bx_gsm_nt": -0.45,
      "by_gsm_nt": -3.8,
      "bz_gsm_nt": 1.39,
      "bt_nt": 4.08
    },
    {
      "time": "2026-11-01T19:38:00Z",
      "source": "ACE",
      "density_cm3": 1.43,
      "speed_kms": 476.16,
      "bx_gsm_nt": -1.31,
      "by_gsm_nt": -3.76,
      "bz_gsm_nt": 0.26,
      "bt_nt": 3.99
    },
    {
      "time": "2026-11-01T19:46:00Z",
      "source": "ACE",
      "density_cm3": 1.37,
      "speed_kms": 448.17,
      "bx_gsm_nt": 0.23,
      "by_gsm_nt": -2.69,
      "bz_gsm_nt": -1.65,
      "bt_nt": 3.16
    },
    {
      "time": "2026-11-01T19:51:00Z",
      "source": "ACE",
      "density_cm3": 1.53,
      "speed_kms": 475.02,
      "bx_gsm_nt": -2.44,
      "by_gsm_nt": -0.56,
      "bz_gsm_nt": 1.8,
      "bt_nt": 3.08
    },
    {
      "time": "2026-11-01T19:58:00Z",
      "source": "ACE",
      "density_cm3": 1.66,
      "speed_kms": 495.4,
      "bx_gsm_nt": -3.31,
      "by_gsm_nt": 0.66,
      "bz_gsm_nt": 1.04,
      "bt_nt": 3.53
    },
    {
      "time": "2026-11-01T20:04:00Z",
      "source": "ACE",
      "density_cm3": 0.87,
      "speed_kms": 460.38,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T20:10:00Z",
      "source": "ACE",
      "density_cm3": 1.59,
      "speed_kms": 487.59,
      "bx_gsm_nt": -3.68,
      "by_gsm_nt": 1.48,
      "bz_gsm_nt": -0.29,
      "bt_nt": 3.98
    },
    {
      "time": "2026-11-01T20:19:00Z",
      "source": "ACE",
      "density_cm3": 2.18,
      "speed_kms": 486.12,
      "bx_gsm_nt": -2.89,
      "by_gsm_nt": -0.16,
      "bz_gsm_nt": -2.05,
      "bt_nt": 3.55
    },
    {
      "time": "2026-11-01T20:26:00Z",
      "source": "ACE",
      "density_cm3": 1.47,
      "speed_kms": 487.44,
      "bx_gsm_nt": -0.91,
      "by_gsm_nt": -2.77,
      "bz_gsm_nt": 2.3,
      "bt_nt": 3.72
    },
    {
      "time": "2026-11-01T20:33:00Z",
      "source": "ACE",
      "density_cm3": 0.98,
      "speed_kms": 446.84,
      "bx_gsm_nt": 1.25,
      "by_gsm_nt": -2.22,
      "bz_gsm_nt": -1.68,
      "bt_nt": 3.04
    },
    {
      "time": "2026-11-01T20:38:00Z",
      "source": "ACE",
      "density_cm3": 1.37,
      "speed_kms": 472.22,
      "bx_gsm_nt": -0.09,
      "by_gsm_nt": -0.18,
      "bz_gsm_nt": 1.76,
      "bt_nt": 1.77
    },
    {
      "time": "2026-11-01T20:44:00Z",
      "source": "ACE",
      "density_cm3": 1.11,
      "speed_kms": 464.97,
      "bx_gsm_nt": 1.4,
      "by_gsm_nt": -2.51,
      "bz_gsm_nt": -1.23,
      "bt_nt": 3.13
    },
    {
      "time": "2026-11-01T20:51:00Z",
      "source": "ACE",
      "density_cm3": 1.07,
      "speed_kms": 471.05,
      "bx_gsm_nt": 1.81,
      "by_gsm_nt": -3.21,
      "bz_gsm_nt": -0.75,
      "bt_nt": 3.76
    },
    {
      "time": "2026-11-01T20:56:00Z",
      "source": "ACE",
      "density_cm3": 1.22,
      "speed_kms": 470.98,
      "bx_gsm_nt": -1.59,
      "by_gsm_nt": -1.26,
      "bz_gsm_nt": -1.26,
      "bt_nt": 2.39
    },
    {
      "time": "2026-11-01T21:04:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -0.85,
      "by_gsm_nt": -2.05,
      "bz_gsm_nt": -0.55,
      "bt_nt": 2.29
    },
    {
      "time": "2026-11-01T21:09:00Z",
      "source": "ACE",
      "density_cm3": 1.07,
      "speed_kms": 488.94,
      "bx_gsm_nt": 0.35,
      "by_gsm_nt": -2.42,
      "bz_gsm_nt": -0.18,
      "bt_nt": 2.46
    },
    {
      "time": "2026-11-01T21:14:00Z",
      "source": "ACE",
      "density_cm3": 1.58,
      "speed_kms": 461.02,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T21:20:00Z",
      "source": "ACE",
      "density_cm3": 1.55,
      "speed_kms": 465.67,
      "bx_gsm_nt": 1.21,
      "by_gsm_nt": -3.26,
      "bz_gsm_nt": -1.06,
      "bt_nt": 3.64
    },
    {
      "time": "2026-11-01T21:28:00Z",
      "source": "ACE",
      "density_cm3": 1.65,
      "speed_kms": 471.66,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T21:34:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 0.84,
      "by_gsm_nt": -3.98,
      "bz_gsm_nt": 0.31,
      "bt_nt": 4.07
    },
    {
      "time": "2026-11-01T21:39:00Z",
      "source": "ACE",
      "density_cm3": 1.48,
      "speed_kms": 468.02,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T21:45:00Z",
      "source": "ACE",
      "density_cm3": 1.58,
      "speed_kms": 469.38,
      "bx_gsm_nt": 0.87,
      "by_gsm_nt": -3.83,
      "bz_gsm_nt": 0.34,
      "bt_nt": 3.95
    },
    {
      "time": "2026-11-01T22:01:00Z",
      "source": "ACE",
      "density_cm3": 1.63,
      "speed_kms": 457.68,
      "bx_gsm_nt": -0.04,
      "by_gsm_nt": -3.99,
      "bz_gsm_nt": 0.87,
      "bt_nt": 4.09
    },
    {
      "time": "2026-11-01T22:07:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 0.04,
      "by_gsm_nt": -3.84,
      "bz_gsm_nt": 1.23,
      "bt_nt": 4.03
    },
    {
      "time": "2026-11-01T22:13:00Z",
      "source": "ACE",
      "density_cm3": 1.6,
      "speed_kms": 458.15,
      "bx_gsm_nt": -0.55,
      "by_gsm_nt": -4.0,
      "bz_gsm_nt": 1.21,
      "bt_nt": 4.22
    },
    {
      "time": "2026-11-01T22:18:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -1.28,
      "by_gsm_nt": -3.8,
      "bz_gsm_nt": 0.44,
      "bt_nt": 4.03
    },
    {
      "time": "2026-11-01T22:23:00Z",
      "source": "ACE",
      "density_cm3": 1.6,
      "speed_kms": 457.65,
      "bx_gsm_nt": -1.25,
      "by_gsm_nt": -4.06,
      "bz_gsm_nt": 1.11,
      "bt_nt": 4.39
    },
    {
      "time": "2026-11-01T22:28:00Z",
      "source": "ACE",
      "density_cm3": 1.7,
      "speed_kms": 460.09,
      "bx_gsm_nt": -1.39,
      "by_gsm_nt": -4.07,
      "bz_gsm_nt": 1.14,
      "bt_nt": 4.45
    },
    {
      "time": "2026-11-01T22:33:00Z",
      "source": "ACE",
      "density_cm3": 1.59,
      "speed_kms": 462.27,
      "bx_gsm_nt": -1.21,
      "by_gsm_nt": -4.08,
      "bz_gsm_nt": 0.37,
      "bt_nt": 4.27
    },
    {
      "time": "2026-11-01T22:39:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -2.04,
      "by_gsm_nt": -3.81,
      "bz_gsm_nt": 0.43,
      "bt_nt": 4.34
    },
    {
      "time": "2026-11-01T22:45:00Z",
      "source": "ACE",
      "density_cm3": 1.98,
      "speed_kms": 471.08,
      "bx_gsm_nt": -2.31,
      "by_gsm_nt": -3.87,
      "bz_gsm_nt": 1.23,
      "bt_nt": 4.68
    },
    {
      "time": "2026-11-01T22:51:00Z",
      "source": "ACE",
      "density_cm3": 1.62,
      "speed_kms": 463.72,
      "bx_gsm_nt": -1.77,
      "by_gsm_nt": -4.2,
      "bz_gsm_nt": 1.47,
      "bt_nt": 4.79
    },
    {
      "time": "2026-11-01T22:56:00Z",
      "source": "ACE",
      "density_cm3": 1.76,
      "speed_kms": 476.54,
      "bx_gsm_nt": -2.03,
      "by_gsm_nt": -4.26,
      "bz_gsm_nt": 1.56,
      "bt_nt": 4.97
    },
    {
      "time": "2026-11-01T23:02:00Z",
      "source": "ACE",
      "density_cm3": 1.45,
      "speed_kms": 456.78,
      "bx_gsm_nt": -2.2,
      "by_gsm_nt": -4.3,
      "bz_gsm_nt": 1.47,
      "bt_nt": 5.05
    },
    {
      "time": "2026-11-01T23:07:00Z",
      "source": "ACE",
      "density_cm3": 1.92,
      "speed_kms": 466.46,
      "bx_gsm_nt": -1.83,
      "by_gsm_nt": -3.3,
      "bz_gsm_nt": 0.69,
      "bt_nt": 3.83
    },
    {
      "time": "2026-11-01T23:13:00Z",
      "source": "ACE",
      "density_cm3": 2.44,
      "speed_kms": 479.62,
      "bx_gsm_nt": -2.28,
      "by_gsm_nt": -4.31,
      "bz_gsm_nt": 1.64,
      "bt_nt": 5.15
    },
    {
      "time": "2026-11-01T23:19:00Z",
      "source": "ACE",
      "density_cm3": 1.31,
      "speed_kms": 450.31,
      "bx_gsm_nt": -2.51,
      "by_gsm_nt": -4.41,
      "bz_gsm_nt": 1.3,
      "bt_nt": 5.24
    },
    {
      "time": "2026-11-01T23:24:00Z",
      "source": "ACE",
      "density_cm3": 2.34,
      "speed_kms": 466.84,
      "bx_gsm_nt": -2.1,
      "by_gsm_nt": -0.65,
      "bz_gsm_nt": 2.97,
      "bt_nt": 3.7
    },
    {
      "time": "2026-11-01T23:29:00Z",
      "source": "ACE",
      "density_cm3": 2.67,
      "speed_kms": 475.23,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T23:34:00Z",
      "source": "ACE",
      "density_cm3": 2.72,
      "speed_kms": 467.06,
      "bx_gsm_nt": -2.35,
      "by_gsm_nt": -1.95,
      "bz_gsm_nt": 1.68,
      "bt_nt": 3.48
    },
    {
      "time": "2026-11-01T23:39:00Z",
      "source": "ACE",
      "density_cm3": 2.81,
      "speed_kms": 472.2,
      "bx_gsm_nt": -1.64,
      "by_gsm_nt": -3.76,
      "bz_gsm_nt": 1.72,
      "bt_nt": 4.45
    },
    {
      "time": "2026-11-01T23:44:00Z",
      "source": "ACE",
      "density_cm3": 2.22,
      "speed_kms": 473.6,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-01T23:50:00Z",
      "source": "ACE",
      "density_cm3": 2.34,
      "speed_kms": 481.62,
      "bx_gsm_nt": -1.89,
      "by_gsm_nt": -3.85,
      "bz_gsm_nt": 2.15,
      "bt_nt": 4.8
    },
    {
      "time": "2026-11-01T23:55:00Z",
      "source": "ACE",
      "density_cm3": 2.67,
      "speed_kms": 468.49,
      "bx_gsm_nt": -1.14,
      "by_gsm_nt": -1.77,
      "bz_gsm_nt": 1.03,
      "bt_nt": 2.34
    },
    {
      "time": "2026-11-02T00:01:00Z",
      "source": "ACE",
      "density_cm3": 3.48,
      "speed_kms": 470.54,
      "bx_gsm_nt": -0.53,
      "by_gsm_nt": -2.66,
      "bz_gsm_nt": 1.41,
      "bt_nt": 3.06
    },
    {
      "time": "2026-11-02T00:06:00Z",
      "source": "ACE",
      "density_cm3": 2.89,
      "speed_kms": 454.38,
      "bx_gsm_nt": -0.55,
      "by_gsm_nt": -2.64,
      "bz_gsm_nt": 1.81,
      "bt_nt": 3.25
    },
    {
      "time": "2026-11-02T00:12:00Z",
      "source": "ACE",
      "density_cm3": 3.53,
      "speed_kms": 458.87,
      "bx_gsm_nt": -2.04,
      "by_gsm_nt": -1.74,
      "bz_gsm_nt": 2.54,
      "bt_nt": 3.69
    },
    {
      "time": "2026-11-02T00:17:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -1.25,
      "by_gsm_nt": -2.69,
      "bz_gsm_nt": 1.53,
      "bt_nt": 3.34
    },
    {
      "time": "2026-11-02T00:23:00Z",
      "source": "ACE",
      "density_cm3": 3.33,
      "speed_kms": 438.08,
      "bx_gsm_nt": -1.37,
      "by_gsm_nt": -2.32,
      "bz_gsm_nt": 1.78,
      "bt_nt": 3.23
    },
    {
      "time": "2026-11-02T00:28:00Z",
      "source": "ACE",
      "density_cm3": 4.33,
      "speed_kms": 454.36,
      "bx_gsm_nt": -1.08,
      "by_gsm_nt": -3.34,
      "bz_gsm_nt": 1.48,
      "bt_nt": 3.81
    },
    {
      "time": "2026-11-02T00:34:00Z",
      "source": "ACE",
      "density_cm3": 3.69,
      "speed_kms": 422.57,
      "bx_gsm_nt": -1.75,
      "by_gsm_nt": -3.18,
      "bz_gsm_nt": 1.78,
      "bt_nt": 4.04
    },
    {
      "time": "2026-11-02T00:40:00Z",
      "source": "ACE",
      "density_cm3": 5.28,
      "speed_kms": 464.51,
      "bx_gsm_nt": -1.09,
      "by_gsm_nt": -2.65,
      "bz_gsm_nt": 2.64,
      "bt_nt": 3.9
    },
    {
      "time": "2026-11-02T00:45:00Z",
      "source": "ACE",
      "density_cm3": 2.97,
      "speed_kms": 441.04,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T00:52:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -1.85,
      "by_gsm_nt": -4.01,
      "bz_gsm_nt": 1.76,
      "bt_nt": 4.75
    },
    {
      "time": "2026-11-02T00:57:00Z",
      "source": "ACE",
      "density_cm3": 3.68,
      "speed_kms": 476.31,
      "bx_gsm_nt": -1.17,
      "by_gsm_nt": -4.16,
      "bz_gsm_nt": 1.37,
      "bt_nt": 4.54
    },
    {
      "time": "2026-11-02T01:02:00Z",
      "source": "ACE",
      "density_cm3": 3.32,
      "speed_kms": 451.71,
      "bx_gsm_nt": -1.27,
      "by_gsm_nt": -4.39,
      "bz_gsm_nt": 1.11,
      "bt_nt": 4.7
    },
    {
      "time": "2026-11-02T01:08:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -2.69,
      "by_gsm_nt": -4.1,
      "bz_gsm_nt": -0.42,
      "bt_nt": 4.93
    },
    {
      "time": "2026-11-02T01:13:00Z",
      "source": "ACE",
      "density_cm3": 3.24,
      "speed_kms": 438.19,
      "bx_gsm_nt": -2.72,
      "by_gsm_nt": -4.02,
      "bz_gsm_nt": -0.54,
      "bt_nt": 4.88
    },
    {
      "time": "2026-11-02T01:19:00Z",
      "source": "ACE",
      "density_cm3": 3.21,
      "speed_kms": 456.05,
      "bx_gsm_nt": -2.03,
      "by_gsm_nt": -2.98,
      "bz_gsm_nt": -0.76,
      "bt_nt": 3.69
    },
    {
      "time": "2026-11-02T01:24:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": -0.89,
      "by_gsm_nt": -2.92,
      "bz_gsm_nt": -0.17,
      "bt_nt": 3.06
    },
    {
      "time": "2026-11-02T01:29:00Z",
      "source": "ACE",
      "density_cm3": 3.66,
      "speed_kms": 483.9,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T01:35:00Z",
      "source": "ACE",
      "density_cm3": 3.56,
      "speed_kms": 459.04,
      "bx_gsm_nt": -0.84,
      "by_gsm_nt": -2.94,
      "bz_gsm_nt": -0.71,
      "bt_nt": 3.14
    },
    {
      "time": "2026-11-02T01:40:00Z",
      "source": "ACE",
      "density_cm3": 4.56,
      "speed_kms": 467.61,
      "bx_gsm_nt": 0.54,
      "by_gsm_nt": -2.67,
      "bz_gsm_nt": -1.26,
      "bt_nt": 3.0
    },
    {
      "time": "2026-11-02T01:45:00Z",
      "source": "ACE",
      "density_cm3": 3.54,
      "speed_kms": 436.25,
      "bx_gsm_nt": 1.5,
      "by_gsm_nt": -2.07,
      "bz_gsm_nt": -1.39,
      "bt_nt": 2.91
    },
    {
      "time": "2026-11-02T01:51:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 1.01,
      "by_gsm_nt": -1.76,
      "bz_gsm_nt": -2.29,
      "bt_nt": 3.06
    },
    {
      "time": "2026-11-02T01:56:00Z",
      "source": "ACE",
      "density_cm3": 2.95,
      "speed_kms": 427.63,
      "bx_gsm_nt": 0.39,
      "by_gsm_nt": -2.69,
      "bz_gsm_nt": -0.79,
      "bt_nt": 2.83
    },
    {
      "time": "2026-11-02T02:02:00Z",
      "source": "ACE",
      "density_cm3": 3.65,
      "speed_kms": 461.65,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T02:08:00Z",
      "source": "ACE",
      "density_cm3": 3.79,
      "speed_kms": 468.72,
      "bx_gsm_nt": 2.13,
      "by_gsm_nt": -1.04,
      "bz_gsm_nt": -1.89,
      "bt_nt": 3.04
    },
    {
      "time": "2026-11-02T02:14:00Z",
      "source": "ACE",
      "density_cm3": 3.53,
      "speed_kms": 458.52,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T02:21:00Z",
      "source": "ACE",
      "density_cm3": 2.55,
      "speed_kms": 445.4,
      "bx_gsm_nt": 2.68,
      "by_gsm_nt": -1.68,
      "bz_gsm_nt": -0.73,
      "bt_nt": 3.24
    },
    {
      "time": "2026-11-02T02:28:00Z",
      "source": "ACE",
      "density_cm3": 2.46,
      "speed_kms": 425.94,
      "bx_gsm_nt": 3.18,
      "by_gsm_nt": -1.24,
      "bz_gsm_nt": -2.28,
      "bt_nt": 4.11
    },
    {
      "time": "2026-11-02T02:33:00Z",
      "source": "ACE",
      "density_cm3": 2.42,
      "speed_kms": 486.58,
      "bx_gsm_nt": 3.71,
      "by_gsm_nt": -1.28,
      "bz_gsm_nt": -2.35,
      "bt_nt": 4.58
    },
    {
      "time": "2026-11-02T02:39:00Z",
      "source": "ACE",
      "density_cm3": 2.38,
      "speed_kms": 476.85,
      "bx_gsm_nt": 4.01,
      "by_gsm_nt": -1.04,
      "bz_gsm_nt": -2.23,
      "bt_nt": 4.7
    },
    {
      "time": "2026-11-02T02:45:00Z",
      "source": "ACE",
      "density_cm3": 2.56,
      "speed_kms": 459.82,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T02:50:00Z",
      "source": "ACE",
      "density_cm3": 9.56,
      "speed_kms": 447.04,
      "bx_gsm_nt": 3.63,
      "by_gsm_nt": -0.31,
      "bz_gsm_nt": -2.56,
      "bt_nt": 4.45
    },
    {
      "time": "2026-11-02T02:56:00Z",
      "source": "ACE",
      "density_cm3": 2.76,
      "speed_kms": 485.94,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T03:03:00Z",
      "source": "ACE",
      "density_cm3": 2.36,
      "speed_kms": 469.48,
      "bx_gsm_nt": 3.28,
      "by_gsm_nt": -0.08,
      "bz_gsm_nt": -2.73,
      "bt_nt": 4.27
    },
    {
      "time": "2026-11-02T03:08:00Z",
      "source": "ACE",
      "density_cm3": 2.7,
      "speed_kms": 479.47,
      "bx_gsm_nt": 3.1,
      "by_gsm_nt": 0.59,
      "bz_gsm_nt": -2.39,
      "bt_nt": 3.96
    },
    {
      "time": "2026-11-02T03:15:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 3.13,
      "by_gsm_nt": -0.81,
      "bz_gsm_nt": -1.9,
      "bt_nt": 3.75
    },
    {
      "time": "2026-11-02T03:21:00Z",
      "source": "ACE",
      "density_cm3": 2.54,
      "speed_kms": 444.0,
      "bx_gsm_nt": 2.48,
      "by_gsm_nt": 0.06,
      "bz_gsm_nt": -2.94,
      "bt_nt": 3.85
    },
    {
      "time": "2026-11-02T03:26:00Z",
      "source": "ACE",
      "density_cm3": 2.59,
      "speed_kms": 498.1,
      "bx_gsm_nt": 2.46,
      "by_gsm_nt": 0.48,
      "bz_gsm_nt": -2.85,
      "bt_nt": 3.8
    },
    {
      "time": "2026-11-02T03:31:00Z",
      "source": "ACE",
      "density_cm3": 2.83,
      "speed_kms": 477.12,
      "bx_gsm_nt": 2.25,
      "by_gsm_nt": 0.0,
      "bz_gsm_nt": -2.84,
      "bt_nt": 3.63
    },
    {
      "time": "2026-11-02T03:37:00Z",
      "source": "ACE",
      "density_cm3": 4.24,
      "speed_kms": 515.48,
      "bx_gsm_nt": 2.21,
      "by_gsm_nt": -0.52,
      "bz_gsm_nt": -1.93,
      "bt_nt": 2.97
    },
    {
      "time": "2026-11-02T03:42:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 2.47,
      "by_gsm_nt": -0.43,
      "bz_gsm_nt": -2.53,
      "bt_nt": 3.56
    },
    {
      "time": "2026-11-02T03:49:00Z",
      "source": "ACE",
      "density_cm3": 2.66,
      "speed_kms": 477.83,
      "bx_gsm_nt": 2.47,
      "by_gsm_nt": -1.12,
      "bz_gsm_nt": -2.82,
      "bt_nt": 3.91
    },
    {
      "time": "2026-11-02T03:55:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 1.54,
      "by_gsm_nt": -0.61,
      "bz_gsm_nt": -1.49,
      "bt_nt": 2.22
    },
    {
      "time": "2026-11-02T04:03:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 2.7,
      "by_gsm_nt": -0.65,
      "bz_gsm_nt": -1.48,
      "bt_nt": 3.15
    },
    {
      "time": "2026-11-02T04:08:00Z",
      "source": "ACE",
      "density_cm3": 2.93,
      "speed_kms": 482.93,
      "bx_gsm_nt": 3.18,
      "by_gsm_nt": -0.23,
      "bz_gsm_nt": -0.74,
      "bt_nt": 3.27
    },
    {
      "time": "2026-11-02T04:14:00Z",
      "source": "ACE",
      "density_cm3": 3.46,
      "speed_kms": 489.74,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T04:20:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 2.1,
      "by_gsm_nt": -0.94,
      "bz_gsm_nt": -1.43,
      "bt_nt": 2.71
    },
    {
      "time": "2026-11-02T04:25:00Z",
      "source": "ACE",
      "density_cm3": 2.52,
      "speed_kms": 456.79,
      "bx_gsm_nt": 2.26,
      "by_gsm_nt": -1.69,
      "bz_gsm_nt": -0.86,
      "bt_nt": 2.95
    },
    {
      "time": "2026-11-02T04:32:00Z",
      "source": "ACE",
      "density_cm3": 2.07,
      "speed_kms": 457.78,
      "bx_gsm_nt": 1.3,
      "by_gsm_nt": -0.55,
      "bz_gsm_nt": -1.77,
      "bt_nt": 2.27
    },
    {
      "time": "2026-11-02T04:37:00Z",
      "source": "ACE",
      "density_cm3": 1.92,
      "speed_kms": 477.99,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T04:42:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 4.51,
      "by_gsm_nt": 0.39,
      "bz_gsm_nt": -0.5,
      "bt_nt": 4.55
    },
    {
      "time": "2026-11-02T04:49:00Z",
      "source": "ACE",
      "density_cm3": 2.06,
      "speed_kms": 479.35,
      "bx_gsm_nt": 1.23,
      "by_gsm_nt": -1.38,
      "bz_gsm_nt": -1.17,
      "bt_nt": 2.19
    },
    {
      "time": "2026-11-02T04:54:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 1.3,
      "by_gsm_nt": -1.0,
      "bz_gsm_nt": -2.06,
      "bt_nt": 2.64
    },
    {
      "time": "2026-11-02T05:00:00Z",
      "source": "ACE",
      "density_cm3": 2.11,
      "speed_kms": 486.3,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T05:08:00Z",
      "source": "ACE",
      "density_cm3": 2.78,
      "speed_kms": 514.5,
      "bx_gsm_nt": 0.59,
      "by_gsm_nt": 0.07,
      "bz_gsm_nt": -1.5,
      "bt_nt": 1.61
    },
    {
      "time": "2026-11-02T05:13:00Z",
      "source": "ACE",
      "density_cm3": 1.79,
      "speed_kms": 504.0,
      "bx_gsm_nt": null,
      "by_gsm_nt": null,
      "bz_gsm_nt": null,
      "bt_nt": null
    },
    {
      "time": "2026-11-02T05:18:00Z",
      "source": "ACE",
      "density_cm3": 1.58,
      "speed_kms": 472.28,
      "bx_gsm_nt": 1.93,
      "by_gsm_nt": -1.47,
      "bz_gsm_nt": -2.12,
      "bt_nt": 3.23
    },
    {
      "time": "2026-11-02T05:23:00Z",
      "source": "ACE",
      "density_cm3": null,
      "speed_kms": null,
      "bx_gsm_nt": 2.61,
      "by_gsm_nt": -0.63,
      "bz_gsm_nt": -1.94,
      "bt_nt": 3.31
    },
    {
      "time": "2026-11-02T05:28:00Z",
      "source": "ACE",
      "density_cm3": 2.41,
      "speed_kms": 474.9,
      "bx_gsm_nt": 2.05,
      "by_gsm_nt": -0.27,
      "bz_gsm_nt": -2.09,
      "bt_nt": 2.95
    },
    {
      "time": "2026-11-02T05:33:00Z",
      "source": "ACE",
      "density_cm3": 1.7,
      "speed_kms": 449.81,
      "bx_gsm_nt": 0.47,
      "by_gsm_nt": -0.46,
      "bz_gsm_nt": -0.24,
      "bt_nt": 0.7
    }
  ],
  "observed": [
    {
      "time": "2026-11-01T03:00:00Z",
      "kp": 4.33
    },
    {
      "time": "2026-11-01T06:00:00Z",
      "kp": 3.33
    },
    {
      "time": "2026-11-01T09:00:00Z",
      "kp": 3.33
    },
    {
      "time": "2026-11-01T12:00:00Z",
      "kp": 3.0
    },
    {
      "time": "2026-11-01T15:00:00Z",
      "kp": 2.33
    },
    {
      "time": "2026-11-01T18:00:00Z",
      "kp": 3.0
    },
    {
      "time": "2026-11-01T21:00:00Z",
      "kp": 2.0
    },
    {
      "time": "2026-11-02T00:00:00Z",
      "kp": 1.0
    }
  ],
  "verification": [
    {
      "bin_start": "2026-10-31T06:00:00Z",
      "issued_at": "2026-10-31T04:38:20Z",
      "p10": 0.0003819092147707802,
      "p50": 0.3701562317593471,
      "p90": 1.6533900984495642,
      "observed_kp": 3.33
    }
  ]
};
