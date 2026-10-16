const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.send("Real-Time Chat Backend is Running!");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "POST"]
    }
});

let users = [];

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join", (username) => {
        if (!users.some((user) => user.id === socket.id)) {
            users.push({
                id: socket.id,
                username
            });
        }

        io.emit(
            "users",
            users.map((user) => user.username)
        );

        io.emit("message", {
            username: "System",
            message: `${username} has joined the chat.`
        });
    });

    socket.on("sendMessage", (data) => {
        io.emit("message", data);
    });

    socket.on("disconnect", () => {
        const user = users.find(
            (user) => user.id === socket.id
        );

        users = users.filter(
            (user) => user.id !== socket.id
        );

        if (user) {
            io.emit(
                "users",
                users.map((user) => user.username)
            );

            io.emit("message", {
                username: "System",
                message: `${user.username} has left the chat.`
            });
        }
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});