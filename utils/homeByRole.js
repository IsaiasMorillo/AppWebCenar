const homes = {
    admin: "/admin",
    client: "/client",
    commerce: "/commerce",
    delivery: "/delivery",
}

module.exports = (role) => homes[role] || "/login";