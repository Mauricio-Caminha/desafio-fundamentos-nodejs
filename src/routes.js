import crypto from "node:crypto";

import { Database } from "./db/database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.query;

      const filters = {};

      if (title) filters.title = title;

      if (description) filters.description = description;

      const tasks = database.select(
        "tasks",
        Object.keys(filters).length > 0 ? filters : null,
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      const task = {
        id: crypto.randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(task));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const deletedTask = database.delete("tasks", id);

      if (deletedTask === -1) {
        return res.writeHead(404).end("Task not found");
      }
      return res.writeHead(204).end("Task deleted");
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (title && !description) {
        database.update("tasks", id, { title });
      }

      if (!title && description) {
        database.update("tasks", id, { description });
      }

      if (title && description) {
        database.update("tasks", id, { title, description });
      }

      return res.writeHead(204).end();
    },
  },
];
