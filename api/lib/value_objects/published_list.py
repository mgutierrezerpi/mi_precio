from dataclasses import dataclass
from models import PriceList, ListVersion, Item


@dataclass(frozen=True)
class PublishedList:
    price_list: PriceList
    version: ListVersion
    items: list[Item]
