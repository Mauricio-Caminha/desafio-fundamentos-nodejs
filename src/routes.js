import crypto from "node:crypto";

import { Database } from "./db/database.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import path from "node:path";

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

      if (!title || !description) {
        return res.writeHead(400).end("Title and description are required");
      }

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
      const task = database.select("tasks", { id });

      if (task.length === 0) {
        return res.writeHead(404).end("Task not found");
      }

      if (!title && !description) {
        return res.writeHead(400).end("Title and description are required");
      }

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
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.select("tasks", { id });

      if (task.length === 0) {
        return res.writeHead(404).end("Task not found");
      }

      const updatedTask = database.update("tasks", id, {
        completed_at: task[0].completed_at ? null : new Date(),
      });

      return res.end(JSON.stringify(updatedTask));
    },
  },
];
