from fastapi.testclient import TestClient

from backend.server import app


def test_counter_can_be_incremented() -> None:
    with TestClient(app) as client:
        assert client.get("/api/counter").json() == {"counter": 0}

        response = client.post("/api/counter", json={"amount": 2})

        assert response.status_code == 200
        assert client.get("/api/counter").json() == {"counter": 2}
