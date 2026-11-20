import logging
from typing import Final

HEALTH_CHECK_PATHS: Final = {
    "/api/health/alive",
    "/api/health/ready",
}


class HealthCheckAccessFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if not isinstance(record.args, tuple) or len(record.args) != 5:
            return True

        _, method, full_path, _, status_code = record.args
        path = str(full_path).partition("?")[0]
        # Successful probe traffic repeats every few seconds and adds no signal;
        # failed probes must stay visible so unhealthy dependencies remain clear.
        try:
            is_success = 200 <= int(status_code) < 400
        except TypeError, ValueError:
            return True
        return not (method == "GET" and path in HEALTH_CHECK_PATHS and is_success)


def suppress_health_check_access_logs() -> None:
    logger = logging.getLogger("uvicorn.access")
    # App factory calls can happen repeatedly in tests and reloaders. Reusing the
    # filter prevents duplicate checks while leaving Uvicorn's handlers intact.
    if not any(
        isinstance(existing_filter, HealthCheckAccessFilter)
        for existing_filter in logger.filters
    ):
        logger.addFilter(HealthCheckAccessFilter())
