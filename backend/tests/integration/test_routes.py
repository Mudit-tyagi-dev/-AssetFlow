import pytest
from httpx import AsyncClient
from uuid_utils import uuid7
from app.models.enums import AssetStatus, AssetCondition

@pytest.mark.anyio
async def test_public_endpoints(client: AsyncClient):
    # Test root endpoint
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.anyio
async def test_rbac_matrix_enforcement(client: AsyncClient, seed_data):
    # Retrieve tokens from fixtures
    admin_token = seed_data["tokens"]["admin_a"]
    employee_token = seed_data["tokens"]["employee_a"]
    org_a = seed_data["org_a"]

    # 1. Create a Category
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_emp = {"Authorization": f"Bearer {employee_token}"}

    # Admin creates category (succeeds)
    cat_payload = {"name": "Network Hardware", "custom_fields": {}}
    res_cat = await client.post("/api/v1/org/categories", json=cat_payload, headers=headers_admin)
    assert res_cat.status_code == 201
    cat_id = res_cat.json()["id"]

    # Employee tries to create an asset under that category (blocked - 403)
    asset_payload = {
        "name": "Cisco Router 900",
        "category_id": cat_id,
        "serial_number": "CISCO-900-ABC",
        "acquisition_cost": 5000.0,
        "is_bookable": False
    }
    res_asset_emp = await client.post("/api/v1/assets", json=asset_payload, headers=headers_emp)
    assert res_asset_emp.status_code == 403

    # Admin creates asset (succeeds)
    res_asset_admin = await client.post("/api/v1/assets", json=asset_payload, headers=headers_admin)
    assert res_asset_admin.status_code == 201

@pytest.mark.anyio
async def test_multi_tenant_isolation(client: AsyncClient, seed_data, db_session):
    admin_a_token = seed_data["tokens"]["admin_a"]
    admin_b_token = seed_data["tokens"]["admin_b"]
    org_a = seed_data["org_a"]
    org_b = seed_data["org_b"]

    headers_a = {"Authorization": f"Bearer {admin_a_token}"}
    headers_b = {"Authorization": f"Bearer {admin_b_token}"}

    # 1. Admin A creates a category and an asset in Org A
    cat_res = await client.post("/api/v1/org/categories", json={"name": "Org A Category"}, headers=headers_a)
    assert cat_res.status_code == 201
    cat_a_id = cat_res.json()["id"]

    asset_payload = {
        "name": "Laptop A",
        "category_id": cat_a_id,
        "serial_number": "SN-A-100",
        "is_bookable": False
    }
    asset_res = await client.post("/api/v1/assets", json=asset_payload, headers=headers_a)
    assert asset_res.status_code == 201
    asset_a_id = asset_res.json()["id"]

    # 2. Admin B tries to read Org A's asset (should return 404, not visible to Org B)
    read_res = await client.get(f"/api/v1/assets/{asset_a_id}", headers=headers_b)
    assert read_res.status_code == 404

    # 3. Admin B tries to update Org A's asset (should return 404)
    update_res = await client.put(
        f"/api/v1/assets/{asset_a_id}",
        json={"name": "Hacked Laptop"},
        headers=headers_b
    )
    assert update_res.status_code == 404
