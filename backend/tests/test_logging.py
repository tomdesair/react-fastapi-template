import logging

import pytest

from backend.logging import HealthCheckAccessFilter


@pytest.mark.parametrize("path", ["/api/health/alive", "/api/health/ready"])
@pytest.mark.parametrize("query", ["", "?probe=liveness"])
def test_successful_health_checks_are_not_logged(path: str, query: str) -> None:
    record = logging.LogRecord(
        "uvicorn.access",
        logging.INFO,
        __file__,
        1,
        "",
        ("127.0.0.1:1234", "GET", f"{path}{query}", "1.1", 200),
        None,
    )

    assert HealthCheckAccessFilter().filter(record) is False


@pytest.mark.parametrize(
    ("method", "path", "status"),
    [
        ("POST", "/api/health/ready", 200),
        ("GET", "/api/counters", 200),
        ("GET", "/api/health/ready", 503),
    ],
)
def test_other_access_records_are_logged(method: str, path: str, status: int) -> None:
    record = logging.LogRecord(
        "uvicorn.access",
        logging.INFO,
        __file__,
        1,
        "",
        ("127.0.0.1:1234", method, path, "1.1", status),
        None,
    )

    assert HealthCheckAccessFilter().filter(record) is True
