"""Add push_subscriptions table (Web Push / PWA notifications)."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    @migrator.create_model
    class PushSubscription(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()
        tenant_id = pw.CharField(max_length=32, index=True)
        user_id = pw.CharField(max_length=32, index=True)
        endpoint = pw.TextField(unique=True)
        p256dh = pw.CharField(max_length=255)
        auth = pw.CharField(max_length=255)

        class Meta:
            table_name = "push_subscriptions"


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_model("push_subscriptions")
