/// <reference types="vitest" />

// lib/utils/patch.test.ts
// ✅ Test transformWithDelta met alle 3 operations

import { describe, it, expect } from "vitest";
import { transformWithDelta, normalizePatchDelta } from "./patch";
import type { PatchDelta } from "@/types/project";

describe("transformWithDelta", () => {
  describe("operation: set", () => {
    it("should set scalar value", () => {
      const prev = { projectType: "verbouwing" };
      const delta: PatchDelta = {
        path: "projectNaam",
        operation: "set",
        value: "Villa Test",
      };
      const result = transformWithDelta(prev, delta) as any;
      expect(result.projectNaam).toBe("Villa Test");
      expect(result.projectType).toBe("verbouwing"); // Original preserved
    });
  });

  describe("operation: append", () => {
    it("should append to existing array", () => {
      const prev = { rooms: [{ id: "1", name: "Room1" }] };
      const delta: PatchDelta = {
        path: "rooms",
        operation: "append",
        value: { id: "2", name: "Room2" },
      };
      const result = transformWithDelta(prev, delta);
      expect(result.rooms).toHaveLength(2);
      expect(result.rooms[1].name).toBe("Room2");
    });

    it("should initialize array if missing", () => {
      const prev = {} as any;
      const delta: PatchDelta = {
        path: "rooms",
        operation: "append",
        value: { id: "1", name: "Room1" },
      };
      const result = transformWithDelta(prev, delta) as any;
      expect(result.rooms).toEqual([{ id: "1", name: "Room1" }]);
    });

    it("should handle non-array gracefully", () => {
      const prev = { rooms: "not an array" } as any;
      const delta: PatchDelta = {
        path: "rooms",
        operation: "append",
        value: { id: "1", name: "Room1" },
      };
      const result = transformWithDelta(prev, delta) as any;
      expect(Array.isArray(result.rooms)).toBe(true);
      expect(result.rooms[0].name).toBe("Room1");
    });
  });

  describe("operation: remove", () => {
    it("should remove by index", () => {
      const prev = { rooms: [{ id: "1" }, { id: "2" }, { id: "3" }] };
      const delta: PatchDelta = {
        path: "rooms",
        operation: "remove",
        value: { index: 1 },
      };
      const result = transformWithDelta(prev, delta);
      expect(result.rooms).toHaveLength(2);
      expect(result.rooms.map((r: any) => r.id)).toEqual(["1", "3"]);
    });

    it("should handle invalid index gracefully", () => {
      const prev = { rooms: [{ id: "1" }, { id: "2" }] };
      const delta: PatchDelta = {
        path: "rooms",
        operation: "remove",
        value: { index: 99 },
      };
      const result = transformWithDelta(prev, delta);
      expect(result.rooms).toHaveLength(2); // Unchanged
    });

    it("should handle non-array gracefully", () => {
      const prev = { rooms: "not an array" };
      const delta: PatchDelta = {
        path: "rooms",
        operation: "remove",
        value: { index: 0 },
      };
      const result = transformWithDelta(prev, delta);
      expect(result.rooms).toBe("not an array"); // Unchanged
    });
  });

  describe("normalizePatchDelta", () => {
    it("should convert legacy 'add' to 'append'", () => {
      const delta = {
        path: "items",
        operation: "add",
        value: {},
      } as any;
      const result = normalizePatchDelta(delta);
      expect(result.operation).toBe("append");
    });

    it("should leave other operations unchanged", () => {
      const delta: PatchDelta = {
        path: "name",
        operation: "set",
        value: "test",
      };
      const result = normalizePatchDelta(delta);
      expect(result.operation).toBe("set");
    });
  });
});