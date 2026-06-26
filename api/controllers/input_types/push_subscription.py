from pydantic import BaseModel


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class PushSubscribe(BaseModel):
    """A browser PushSubscription, as returned by PushManager.subscribe()."""

    endpoint: str
    keys: PushKeys


class PushUnsubscribe(BaseModel):
    endpoint: str
