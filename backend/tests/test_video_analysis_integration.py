import pytest

from backend.services.analysis_service import AnalysisService


class FakeTable:
    def __init__(self):
        self.calls = []

    def insert(self, data):
        self.calls.append(("insert", data))
        return self

    def update(self, data):
        self.calls.append(("update", data))
        return self

    def select(self, *args, **kwargs):
        self.calls.append(("select", args, kwargs))
        return self

    def delete(self):
        self.calls.append(("delete", None))
        return self

    def eq(self, *args, **kwargs):
        self.calls.append(("eq", args, kwargs))
        return self

    def order(self, *args, **kwargs):
        self.calls.append(("order", args, kwargs))
        return self

    def limit(self, *args, **kwargs):
        self.calls.append(("limit", args, kwargs))
        return self

    def offset(self, *args, **kwargs):
        self.calls.append(("offset", args, kwargs))
        return self

    def execute(self):
        return type("Result", (), {"data": []})()


@pytest.mark.asyncio
async def test_video_module_uses_video_service(monkeypatch):
    service = AnalysisService()
    fake_table = FakeTable()
    service._table = lambda name: fake_table

    async def fake_publish(*args, **kwargs):
        return None

    monkeypatch.setattr("backend.services.analysis_service.event_bus.publish_analysis_started", fake_publish)
    monkeypatch.setattr("backend.services.analysis_service.event_bus.publish_analysis_completed", fake_publish)
    monkeypatch.setattr("backend.services.analysis_service.event_bus.publish_analysis_failed", fake_publish)

    class FakeVideoService:
        def __init__(self):
            self.calls = []

        async def analyze_video(self, **kwargs):
            self.calls.append(kwargs)
            return {
                "confidence": 0.8,
                "verdict": "real",
                "risk_level": "low",
                "evidence": [],
                "report_data": {"executive_summary": {"trust_score": 80}},
                "pdf_path": None,
            }

    fake_video_service = FakeVideoService()
    monkeypatch.setattr("backend.services.analysis_service.video_analysis_service", fake_video_service)

    await service._run_pipeline(
        analysis_id="analysis-1",
        user_id="user-1",
        module="video",
        input_content="/tmp/sample.mp4",
        input_type="file:video",
        source_url=None,
        title="Sample video",
        created_at="2026-01-01T00:00:00Z",
    )

    assert fake_video_service.calls
    assert any(call.get("video_path") == "/tmp/sample.mp4" for call in fake_video_service.calls)
