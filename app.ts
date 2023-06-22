import app from "./src/index";

app.listen(process.env.PORT ?? 4000, function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT ?? 4000}`);
});