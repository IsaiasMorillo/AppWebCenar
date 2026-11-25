const homes = {
    admin: "/admin",
    user: "/user",
    commerce: "/commerce",
    delivery: "/delivery",
}

module.exports = (role) => homes[role] || "/login";