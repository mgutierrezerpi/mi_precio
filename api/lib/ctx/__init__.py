"""Contexts - interface layer between controllers and models."""

from lib.ctx import identity_context as identity
from lib.ctx import auth_context as auth
from lib.ctx import lists_context as lists
from lib.ctx import versions_context as versions
from lib.ctx import items_context as items
from lib.ctx import products_context as products
from lib.ctx import categories_context as categories
from lib.ctx import analytics_context as analytics
from lib.ctx import public_context as public
from lib.ctx import customers_context as customers
from lib.ctx import activity_context as activity

# Explicit re-exports
identity = identity
auth = auth
lists = lists
versions = versions
items = items
products = products
categories = categories
analytics = analytics
public = public
customers = customers
activity = activity
