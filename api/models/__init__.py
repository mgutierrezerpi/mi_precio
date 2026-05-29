from models.base import db as db, BaseModel as BaseModel
from models.tenant import Tenant as Tenant
from models.user import User as User
from models.auth_code import AuthCode as AuthCode
from models.price_list import PriceList as PriceList
from models.list_version import ListVersion as ListVersion
from models.item import Item as Item

# Resolve deferred foreign key
Item.list_version.set_model(ListVersion)


def create_tables():
    db.create_tables([Tenant, User, AuthCode, PriceList, ListVersion, Item])
