from views.base_view import BaseView


class VisitBucketView(BaseView):
    today: int
    yesterday: int
    total: int
    change_pct: int


class VisitStatsView(VisitBucketView):
    qr: VisitBucketView

    @classmethod
    def render(cls, stats: dict):
        return cls.model_validate(stats)


class ReportKpisView(BaseView):
    visits: int
    qr_scans: int
    customers: int
    revenue: str


class ReportDayView(BaseView):
    date: str
    link: int
    qr: int


class TopProductView(BaseView):
    name: str
    units: int
    revenue: str


class ReportsView(BaseView):
    days: int
    list_id: str | None = None
    customer_id: str | None = None
    kpis: ReportKpisView
    series: list[ReportDayView]
    channels: dict[str, int]
    top_products: list[TopProductView]

    @classmethod
    def render(cls, report: dict):
        return cls.model_validate(report)
