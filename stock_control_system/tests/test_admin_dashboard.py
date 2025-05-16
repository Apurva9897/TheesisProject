def test_get_overview(client):
    response = client.get('/admin/overview')
    assert response.status_code == 200
    assert "total_inventory" in response.json
