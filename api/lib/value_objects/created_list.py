from dataclasses import dataclass

from models import ListVersion, PriceList


@dataclass(frozen=True)
class CreatedList:
    price_list: PriceList
    version: ListVersion
