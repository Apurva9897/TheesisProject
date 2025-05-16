def test_login_fail(client):
    response = client.post('/auth/login', json={
        "email": "fake@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert response.json['message'] == "Invalid credentials"
