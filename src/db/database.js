import fs from "node:fs/promises";

const databasePath = new URL("./database.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2));
  }

  select(table, filters) {
    let data = this.#database[table] ?? [];

    if (filters) {
      data = data.filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
          return row[key]?.toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex((data) => data.id === id);
    const updated_at = new Date();

    if (rowIndex === -1) return rowIndex;

    this.#database[table][rowIndex] = {
      ...this.#database[table][rowIndex],
      ...data,
      updated_at,
    };

    this.#persist();

    return this.#database[table][rowIndex];
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((data) => data.id === id);

    if (rowIndex === -1) return rowIndex;

    this.#database[table].splice(rowIndex, 1);
    this.#persist();
    return rowIndex;
  }
}
