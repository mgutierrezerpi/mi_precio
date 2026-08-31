from models.base import db


def columns_for(table_name: str) -> list[str] | None:
    if not db.table_exists(table_name):
        return None
    return [column.name for column in db.get_columns(table_name)]


def add_missing_columns(
    table_name: str, columns_to_add: list[tuple[str, str]]
) -> None:
    columns = columns_for(table_name)
    if columns is None:
        return
    for name, ddl in columns_to_add:
        if name not in columns:
            db.execute_sql(f"ALTER TABLE {table_name} ADD COLUMN {ddl}")
