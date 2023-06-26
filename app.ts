import app from "./src/index";

require("dotenv").config();

app.listen(process.env.PORT ?? 5000, function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT ?? 5000}`);
});