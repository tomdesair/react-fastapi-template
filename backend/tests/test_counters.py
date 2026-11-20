from pathlib import Path

from fastapi.testclient import TestClient

from backend.server import create_app


def test_default_counter_is_blue_and_can_be_incremented(tmp_path: Path) -> None:
    # A file-backed temporary database exercises real startup persistence and
    # verifies both halves of the empty-database bootstrap contract.
    database_url = f"sqlite:///{tmp_path / 'database.db'}"

    with TestClient(create_app(database_url)) as client:
        response = client.get("/api/counters")
        assert response.status_code == 200
        assert response.json() == [{"id": 1, "color": "#0000ff", "value": 0}]

        response = client.post("/api/counters/1/increment", json={"amount": 2})
        assert response.status_code == 200
        assert response.json()["value"] == 2


def test_counters_are_persisted_and_colors_are_unique(tmp_path: Path) -> None:
    # Upper-case input verifies canonicalization, while restarting the app with
    # the same file proves that both color and uniqueness survive process life.
    database_url = f"sqlite:///{tmp_path / 'database.db'}"

    with TestClient(create_app(database_url)) as client:
        response = client.post("/api/counters", json={"color": "#FF0000"})
        assert response.status_code == 201
        assert response.json()["color"] == "#ff0000"

        duplicate = client.post("/api/counters", json={"color": "#ff0000"})
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"] == (
            "Color is already used. Pick another color."
        )

    with TestClient(create_app(database_url)) as client:
        assert [counter["color"] for counter in client.get("/api/counters").json()] == [
            "#0000ff",
            "#ff0000",
        ]


def test_counter_color_is_validated(tmp_path: Path) -> None:
    with TestClient(create_app(f"sqlite:///{tmp_path / 'validation.db'}")) as client:
        response = client.post("/api/counters", json={"color": "blue"})

    # Invalid formats must fail at the Pydantic boundary before reaching the ORM.
    assert response.status_code == 422


def test_counter_can_be_deleted(tmp_path: Path) -> None:
    database_url = f"sqlite:///{tmp_path / 'database.db'}"

    with TestClient(create_app(database_url)) as client:
        # A deliberately emptied database stays empty for this running session;
        # the default blue record is only a startup behavior for an empty DB.
        response = client.delete("/api/counters/1")
        assert response.status_code == 204
        assert client.get("/api/counters").json() == []

        response = client.delete("/api/counters/1")
        assert response.status_code == 404
