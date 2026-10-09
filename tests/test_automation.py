import pytest
from faker import Faker

fake = Faker()

class MockUserSystem:
    def __init__(self):
        self.users = {}

    def register_user(self, name, email):
        if email in self.users:
            raise ValueError("Erro: E-mail já cadastrado!")
        user_id = fake.uuid4()
        self.users[email] = {"id": user_id, "name": name, "email": email}
        return self.users[email]

@pytest.fixture
def system_db():
    return MockUserSystem()

def test_user_registration_success(system_db):
    name = fake.name()
    email = fake.email()
    
    user = system_db.register_user(name, email)
    
    assert "id" in user
    assert user["email"] == email

def test_duplicate_email_prevention(system_db):
    name = fake.name()
    email = fake.email()
    
    system_db.register_user(name, email)
    
    with pytest.raises(ValueError, match="Erro: E-mail já cadastrado!"):
        system_db.register_user(fake.name(), email)
