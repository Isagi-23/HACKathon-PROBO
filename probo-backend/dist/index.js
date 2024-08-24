"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routers/user"));
const admin_1 = __importDefault(require("./routers/admin"));
const app = (0, express_1.default)();
app.use("/v1/admin", user_1.default);
app.use("/v1/user", admin_1.default);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.listen(3000, () => console.log("Server started on port 3000"));
