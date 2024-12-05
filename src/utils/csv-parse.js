import fs from "node:fs";
import { parse } from "csv-parse";

const csvPath = new URL("./tasks.csv", import.meta.url);

async function uploadTasksRoute(title, description) {
  fetch("http://localhost:3333/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(title, description),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
}

async function generateFile() {
  const tasks = [
    ["Task 01", ",Descrição da Task 01"],
    ["Task 02", ",Descrição da Task 02"],
    ["Task 03", ",Descrição da Task 03"],
    ["Task 04", ",Descrição da Task 04"],
    ["Task 05", ",Descrição da Task 05"],
  ];

  const tasksCsv = tasks.map((task) => task.join("")).join("\n");

  fs.writeFile(csvPath, `title,description\n${tasksCsv}`, (err) => {
    if (err) {
      console.error(err);
    }
  });
}

async function processFile() {
  const parser = fs.createReadStream(csvPath).pipe(
    parse({
      delimiter: ",",
      from_line: 2,
    }),
  );

  // Utilizando for await
  for await (const record of parser) {
    uploadTasksRoute({
      title: record[0],
      description: record[1],
    });

    console.log(`Uploaded task: ${record[0]}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Utilizando parse com eventos da lib csv-parse
  // parser
  //   .on("readable", async function () {
  //     let record;
  //     while ((record = parser.read()) !== null) {
  //       uploadTasksRoute({
  //         title: record[0],
  //         description: record[1],
  //       });
  //     }
  //   })
  //   .on("end", () => {
  //     console.log("Processing finished");
  //   })
  //   .on("error", (err) => {
  //     console.error(err);
  //   });
}

(async () => {
  await generateFile();
  await processFile();
})();
