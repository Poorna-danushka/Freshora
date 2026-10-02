package Freshora.Backend.user.entity;

public enum Role {
    CUSTOMER(1),
    STORE_MANAGER(2),
    STORE_STAFF(3),
    DRIVER(4),
    ADMIN(5);

    private final int id;

    Role(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }
}
