from fastapi import APIRouter, Depends, HTTPException

from controllers.deps import get_current_user
from controllers.input_types import CreateSupportTicket
from infra.zohodesk import ZohoDeskError
from lib.ctx import activity, support_context as support

router = APIRouter(prefix="/support", tags=["support"])


@router.post("/tickets")
def create_ticket_endpoint(data: CreateSupportTicket, current_user: dict = Depends(get_current_user)):
    email = current_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Tu cuenta no tiene email asociado")

    try:
        ticket = support.create_ticket(
            tenant_id=current_user.get("tenant_id"),
            email=email,
            subject=data.subject,
            description=data.description,
            priority=data.priority,
            name=current_user.get("name"),
        )
    except ZohoDeskError as exc:
        # Not configured yet, or the provider rejected the request. 503 so the
        # frontend can show "support unavailable" without treating it as a bug.
        raise HTTPException(status_code=503, detail=str(exc))

    # Zoho returns a human-facing ticketNumber plus an internal id.
    number = ticket.get("ticketNumber") or ticket.get("id")
    activity.record(
        current_user.get("tenant_id"),
        "support.ticket_created",
        f"Abrió un ticket de soporte: {data.subject}",
        meta={"priority": data.priority, "zohodesk_id": str(ticket.get("id") or "")},
    )
    return {"id": number, "status": "created"}
