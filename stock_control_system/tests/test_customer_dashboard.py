def test_get_products(client):
    response = client.get('/customer_dashboard/products')
    assert response.status_code == 200
    assert "products" in response.json
