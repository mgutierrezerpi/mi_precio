from dataclasses import dataclass
from models import PriceList, ListVersion


@dataclass(frozen=True)
class CreatedList:
    price_list: PriceList
    version: ListVersion
