import configparser
from pathlib import Path

SYSTEMD = Path(__file__).resolve().parents[3] / "ops" / "systemd"


def unit(name: str) -> configparser.ConfigParser:
    parser = configparser.ConfigParser(strict=False, interpolation=None)
    parser.optionxform = str  # systemd keys are case-sensitive
    parser.read(SYSTEMD / name)

    return parser


def test_the_updater_unit_is_tied_to_the_tunnel_and_retries_a_failed_run():
    u = unit("solarbud-api-url.service")

    assert u["Service"]["Type"] == "oneshot"
    assert (
        u["Service"]["Restart"] == "on-failure"
    )  # a failed run must not wait for the next tunnel restart
    assert u["Service"]["RestartSec"] == "2min"
    assert u["Unit"]["StartLimitBurst"] == "5"
    assert u["Unit"]["PartOf"] == "solarbud-tunnel.service"
    assert u["Install"]["WantedBy"] == "solarbud-tunnel.service"


def test_the_tunnel_unit_is_kept_in_the_repo_with_the_flags_that_work_on_this_network():
    t = unit("solarbud-tunnel.service")

    assert "--protocol http2" in t["Service"]["ExecStart"]  # QUIC/UDP is blocked here
    assert "--url http://localhost:8000" in t["Service"]["ExecStart"]
