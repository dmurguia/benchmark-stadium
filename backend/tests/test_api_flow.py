"""End-to-end API flow: login → prompt → tournament votes → reveal → leaderboard."""


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
    resp = auth_client.post("/api/battles", json={"prompt": "a landing page for a coffee subscription", "category": "website"})
    assert resp.status_code == 200, resp.text
    battle = resp.json()
    assert battle["status"] == "voting"
    assert len(battle["generations"]) == 4
    # anonymized until complete
    assert all(g["model"] is None for g in battle["generations"])
    assert len(battle["matches"]) == 4

    # 4 votes: semi1, semi2, final, third
    for _ in range(4):
        assert battle["status"] == "voting"
        battle = _vote_out_current_match(auth_client, battle)

    assert battle["status"] == "complete"
    assert battle["current_match_id"] is None
    # identities revealed
    assert all(g["model"] is not None for g in battle["generations"])

    # generation html serves for iframes
    resp = auth_client.get(f"/api/battles/{battle['public_id']}/generations/0/html")
    assert resp.status_code == 200
    assert "<html" in resp.text.lower()

    # battle shows up in history with the finals winner
    resp = auth_client.get("/api/battles")
    assert resp.status_code == 200
    mine = resp.json()
    assert any(b["public_id"] == battle["public_id"] and b["winner_model"] for b in mine)


def test_vote_requires_bracket_order(auth_client):
    resp = auth_client.post("/api/battles", json={"prompt": "pricing card", "category": "ui-component"})
    battle = resp.json()
    final = next(m for m in battle["matches"] if m["round"] == "final")
    resp = auth_client.post(
        f"/api/battles/{battle['public_id']}/votes",
        json={"match_id": final["id"], "winner_generation_id": battle["generations"][0]["id"]},
    )
    assert resp.status_code == 422


def test_battle_requires_auth(client):
    resp = client.post("/api/battles", json={"prompt": "anything at all", "category": "website"})
    assert resp.status_code == 401


def test_leaderboard_reflects_votes(auth_client):
    # Complete one battle so at least one category has votes.
    resp = auth_client.post("/api/battles", json={"prompt": "weekly activity chart", "category": "dataviz"})
    battle = resp.json()
    for _ in range(4):
        battle = _vote_out_current_match(auth_client, battle)

    resp = auth_client.post("/api/leaderboard/recompute")
    assert resp.status_code == 200

    resp = auth_client.get("/api/leaderboard/dataviz")
    assert resp.status_code == 200
    board = resp.json()
    assert board["vote_count"] >= 4
    assert len(board["entries"]) >= 2
    assert board["entries"][0]["rank"] == 1

    resp = auth_client.get("/api/leaderboard/overall")
    assert resp.json()["vote_count"] >= 8


def test_categories_and_models(client):
    cats = client.get("/api/categories").json()
    assert {c["slug"] for c in cats} >= {"website", "ui-component", "dataviz", "game", "svg-logo", "ascii-art"}
    models = client.get("/api/models").json()
    assert len(models) >= 4


def test_stats(client):
    stats = client.get("/api/stats").json()
    assert stats["models"] >= 4
    assert stats["categories"] == 6
    assert stats["votes"] >= stats["human_votes"]


def test_leaderboard_rank_delta_after_second_snapshot(auth_client):
    # Two recomputes → the latest snapshot has a predecessor, so every entry
    # carries a movement value (0 when unchanged) instead of None.
    auth_client.post("/api/leaderboard/recompute")
    auth_client.post("/api/leaderboard/recompute")
    board = auth_client.get("/api/leaderboard/overall").json()
    assert board["entries"], "expected entries after recompute"
    assert all(e["rank_delta"] is not None or e["is_new"] for e in board["entries"])
