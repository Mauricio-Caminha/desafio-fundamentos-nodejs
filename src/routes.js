import crypto from "node:crypto";

import { Database } from "./db/database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const users = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null,
      );
      return res.end(JSON.stringify(users));
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

      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      database.delete("tasks", id);

      return res.writeHead(204).end();
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
