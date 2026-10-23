import { openDB } from "idb";
import type { Data } from "./models";
import { emptyData } from "./models";
import { validateData } from "./logic";
const database = () =>
  openDB("little-turtle-planner", 1, {
    upgrade(db) {
      db.createObjectStore("planner");
    },
  });
export async function loadData(): Promise<Data> {
  const db = await database();
  try {
    const value = await db.get("planner", "data");
    return value ? validateData(value) : emptyData();
  } finally {
    db.close();
  }
}
export async function saveData(data: Data) {
  const db = await database();
  try {
    await db.put("planner", data, "data");
  } finally {
    db.close();
  }
}
// Read and write in one IndexedDB transaction: concurrent tabs cannot overwrite unrelated edits.
export async function updateData(change: (data: Data) => Data): Promise<Data> {
  const db = await database();
  try {
    const tx = db.transaction("planner", "readwrite");
    const current = await tx.store.get("data");
    const next = change(current ? validateData(current) : emptyData());
    await tx.store.put(next, "data");
    await tx.done;
    return next;
  } finally {
    db.close();
  }
}
