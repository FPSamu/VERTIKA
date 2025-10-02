import { Request, Response } from "express";

export function getUsers(req: Request, res: Response) {
  res.send(["User ejemplo"]);
}

export function getUserById(req: Request, res: Response) {
  res.json({ id: req.params.id });
}

export function createUser(req: Request, res: Response) {
  res.status(201).json({ id: "new_id", ...req.body });
}

export function updateUser(req: Request, res: Response) {
  res.json({ id: req.params.id, ...req.body });
}

export function deleteUser(req: Request, res: Response) {
  res.status(204).send();
}