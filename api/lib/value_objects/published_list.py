from dataclasses import dataclass

from models import Item, ListVersion, PriceList


@dataclass(frozen=True)
class PublishedList:
    price_list: PriceList
    version: ListVersion
    items: list[Item]
