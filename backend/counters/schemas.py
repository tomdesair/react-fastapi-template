from pydantic import BaseModel, ConfigDict, Field, field_validator


class CounterCreate(BaseModel):
    color: str = Field(pattern=r"^#[0-9a-fA-F]{6}$")

    @field_validator("color")
    @classmethod
    def normalize_color(cls, color: str) -> str:
        # SQLite string uniqueness is case-sensitive by default. Canonicalizing
        # colors prevents #FF0000 and #ff0000 from bypassing the uniqueness
        # guarantee intended by the counter API.
        return color.lower()


class CounterIncrement(BaseModel):
    # The upper bound prevents a single request from causing an unexpectedly
    # large jump while still allowing useful bulk increments.
    amount: int = Field(default=1, ge=1, le=1_000_000)


class CounterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    color: str
    value: int
