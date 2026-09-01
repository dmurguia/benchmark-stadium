"""End-to-end API flow: login → scenario battle → 5 comparisons (incl. the
calibration trap) → reveal → leaderboard → reviewer stats."""


def _vote_out_current_match(client, battle):
    match_id = battle["current_match_id"]
    match = next(m for m in battle["matches"] if m["id"] == match_id)
    resp = client.post(
        f"/api/battles/{battle['public_id']}/votes",
        json={"match_id": match_id, "winner_generation_id": match["a_generation_id"]},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


def test_full_battle_flow(auth_client):
    resp = auth_client.post("/api/battles", json={"category": "contract-redline"})
    assert resp.status_code == 200, resp.text
    battle = resp.json()
    assert battle["status"] == "voting"
    assert battle["scenario_id"]
    # 4 bracket work products + calibration pair
    assert len(battle["generations"]) == 6
    assert all(g["model"] is None for g in battle["generations"])  # anonymized
    assert len(battle["matches"]) == 5
    rounds = [m["round"] for m in battle["matches"]]
    assert rounds == ["semi1", "semi2", "calibration", "final", "third"]

    # 5 comparisons: semi1, semi2, calibration, final, third
    for _ in range(5):
        assert battle["status"] == "voting"
        battle = _vote_out_current_match(auth_client, battle)

    assert battle["status"] == "complete"
    assert battle["current_match_id"] is None
    assert all(g["model"] is not None for g in battle["generations"])  # revealed
    assert battle["trap_outcome"] is not None  # calibration outcome surfaced
    # Exactly one generation carries the broken-artifact flag after reveal.
    assert sum(1 for g in battle["generations"] if g["is_trap"]) == 1

    resp = auth_client.get(f"/api/battles/{battle['public_id']}/generations/0/html")
    assert resp.status_code == 200
    assert "<html" in resp.text.lower()

    resp = auth_client.get("/api/battles")
    assert any(b["public_id"] == battle["public_id"] and b["winner_model"] for b in resp.json())


def test_vote_requires_bracket_order(auth_client):
    resp = auth_client.post("/api/battles", json={"category": "journal-entry"})
    battle = resp.json()
    final = next(m for m in battle["matches"] if m["round"] == "final")
    resp = auth_client.post(
        f"/api/battles/{battle['public_id']}/votes",
        json={"match_id": final["id"], "winner_generation_id": battle["generations"][0]["id"]},
    )
    assert resp.status_code == 422


def test_battle_requires_auth(client):
    resp = client.post("/api/battles", json={"category": "contract-redline"})
    assert resp.status_code == 401


def test_specific_scenario(auth_client):
    resp = auth_client.post(
        "/api/battles", json={"category": "coa-mapping", "scenario_id": "legacy-to-s4-migration"}
    )
    assert resp.status_code == 200
    assert resp.json()["scenario_id"] == "legacy-to-s4-migration"


def test_leaderboard_reflects_votes(auth_client):
    resp = auth_client.post("/api/battles", json={"category": "journal-entry"})
    battle = resp.json()
    for _ in range(5):
        battle = _vote_out_current_match(auth_client, battle)

    resp = auth_client.post("/api/leaderboard/recompute")
    assert resp.status_code == 200

    board = auth_client.get("/api/leaderboard/journal-entry").json()
    assert board["vote_count"] >= 4  # 4 model votes; the trap never counts
    assert len(board["entries"]) >= 2
    assert board["entries"][0]["rank"] == 1

    assert auth_client.get("/api/leaderboard/overall").json()["vote_count"] >= 8


def test_reviewer_stats_and_tier(auth_client):
    # tester@example.com is a work domain → tier 1.
    me = auth_client.get("/api/auth/me").json()
    assert me["tier"] == 1

    resp = auth_client.post("/api/auth/profile", json={"vertical": "finance", "role": "Controller"})
    assert resp.status_code == 200
    assert resp.json()["vertical"] == "finance"

    stats = auth_client.get("/api/auth/reviewer").json()
    assert stats["votes_cast"] >= 4
    assert stats["traps_total"] >= 1
    assert stats["badge"]


def test_free_mail_is_tier_zero(client):
    resp = client.post("/api/auth/request-code", json={"email": "casual@gmail.com"})
    code = resp.json()["dev_code"]
    resp = client.post("/api/auth/verify", json={"email": "casual@gmail.com", "code": code})
    assert resp.json()["user"]["tier"] == 0
    client.cookies.clear()


def test_catalog(client):
    verts = client.get("/api/verticals").json()
    assert {v["slug"] for v in verts} == {"legal", "finance"}
    cats = client.get("/api/categories").json()
    assert {c["slug"] for c in cats} == {"contract-redline", "clause-risk", "journal-entry", "coa-mapping"}
    assert all(c["vertical"] in ("legal", "finance") for c in cats)
    scens = client.get("/api/scenarios/contract-redline").json()
    assert len(scens) >= 2 and all(s["brief"] for s in scens)
    models = client.get("/api/models").json()
    assert len(models) >= 5


def test_stats(client):
    stats = client.get("/api/stats").json()
    assert stats["models"] >= 5
    assert stats["categories"] == 4
    assert stats["votes"] >= stats["human_votes"]


def test_leaderboard_rank_delta_after_second_snapshot(auth_client):
    auth_client.post("/api/leaderboard/recompute")
    auth_client.post("/api/leaderboard/recompute")
    board = auth_client.get("/api/leaderboard/overall").json()
    assert board["entries"], "expected entries after recompute"
    assert all(e["rank_delta"] is not None or e["is_new"] for e in board["entries"])


# ---- company boards (BS-16) ----

def test_products_only_drafted_in_their_vertical(client):
    from app.db import SessionLocal
    from app.services.arena import eligible_models

    db = SessionLocal()
    try:
        legal = {m.slug for m in eligible_models(db, "contract-redline")}
        finance = {m.slug for m in eligible_models(db, "journal-entry")}
    finally:
        db.close()
    assert "gavelpoint-drafts" in legal and "gavelpoint-drafts" not in finance
    assert "ledgerpilot-close" in finance and "ledgerpilot-close" not in legal
    # Declined vendors are never in any draft pool.
    assert "atticus-counsel" not in legal | finance


def test_board_carries_product_metadata_and_declined_vendors(auth_client):
    auth_client.post("/api/leaderboard/recompute")
    board = auth_client.get("/api/leaderboard/clause-risk").json()
    kinds = {e["model"]["kind"] for e in board["entries"]}
    assert kinds <= {"foundation", "product"}
    products = [e for e in board["entries"] if e["model"]["kind"] == "product"]
    for p in products:
        assert p["model"]["provenance"] in ("self-submitted", "buyer-contributed")
        assert p["model"]["submitted_version"]
    declined = board["declined"]
    assert {d["organization"] for d in declined} == {"Atticus AI", "Veritas Legal"}
    assert all(d["note"] for d in declined)
    # Overall board lists every vertical's empty chairs.
    overall = auth_client.get("/api/leaderboard/overall").json()
    assert len(overall["declined"]) == 4


def test_simulate_release_moves_boards_and_feeds_drama(auth_client):
    before = auth_client.get("/api/leaderboard/overall").json()["vote_count"]
    resp = auth_client.post("/api/releases/simulate", json={"model_slug": "gpt-5-mini", "version": "v6 preview"})
    assert resp.status_code == 200, resp.text
    release = resp.json()
    assert release["model"]["slug"] == "gpt-5-mini"
    assert release["version"] == "v6 preview"
    assert release["rerun_votes"] > 0
    assert release["movement"], "expected per-board movement entries"
    for m in release["movement"]:
        assert m["after_rank"] >= 1 and m["after_rating"] > 0

    feed = auth_client.get("/api/releases").json()
    assert feed and feed[0]["id"] == release["id"]

    after = auth_client.get("/api/leaderboard/overall").json()["vote_count"]
    assert after > before


def test_simulate_release_rejects_unknown_and_product_models(auth_client):
    assert auth_client.post("/api/releases/simulate", json={"model_slug": "nope"}).status_code == 422
    # Products don't get foundation-release re-runs; vendors resubmit instead.
    assert auth_client.post("/api/releases/simulate", json={"model_slug": "gavelpoint-drafts"}).status_code == 422
