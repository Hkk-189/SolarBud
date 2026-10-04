from datetime import timedelta

STALE_AFTER = timedelta(minutes=10)
# ponytail: fixed L1 distance; use DSCOVR ephemeris if arrival error matters
L1_TO_BOWSHOCK_KM = 1.436e6
PROTON_MASS_NPA = 1.6726e-6  # Pdyn[nPa] = 1.6726e-6 * n[cm^-3] * V[km/s]^2 (protons only)
KP_G_THRESHOLDS = {g: g + 4 - 1 / 3 for g in range(1, 6)}  # G1 at Kp 5- (4.667) ... G5 at 9-
KP_TOL = 1e-3  # GFZ rounds thirds to 3 decimals
VALID_RANGES = {"speed_kms": (200.0, 3000.0), "density_cm3": (0.0, 200.0)}
B_MAX_NT = 200.0
HORIZONS_H = (1, 3, 6)


def kp_to_g(kp: float) -> int:
    return max((g for g, t in KP_G_THRESHOLDS.items() if kp >= t - KP_TOL), default=0)
