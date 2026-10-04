"""Pure physics features: numpy/pandas in, same out. Units in names (see context.md §4)."""

import numpy as np

from app.core.constants import PROTON_MASS_NPA


def bs(bz):
    return np.maximum(-bz, 0)  # keeps Series type; NaN propagates


def ey_mvm(speed, bz):
    return speed * bs(bz) * 1e-3


def pdyn_npa(density, speed):
    return PROTON_MASS_NPA * density * speed**2


def bt_transverse(by, bz):
    return np.hypot(by, bz)


def clock_angle_deg(by, bz):
    return np.abs(np.degrees(np.arctan2(by, bz)))


def newell(speed, by, bz):
    half = np.radians(clock_angle_deg(by, bz)) / 2
    return speed ** (4 / 3) * bt_transverse(by, bz) ** (2 / 3) * np.sin(half) ** (8 / 3)


def add_physics(df):
    return df.assign(
        bs_nt=bs(df.bz_gsm_nt),
        ey_mvm=ey_mvm(df.speed_kms, df.bz_gsm_nt),
        pdyn_npa=pdyn_npa(df.density_cm3, df.speed_kms),
        newell=newell(df.speed_kms, df.by_gsm_nt, df.bz_gsm_nt),
    )
