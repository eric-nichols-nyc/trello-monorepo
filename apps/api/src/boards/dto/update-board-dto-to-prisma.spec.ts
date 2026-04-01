import { plainToInstance } from "class-transformer";
import { describe, expect, it } from "vitest";
import { BoardBackgroundBrightness } from "../../../generated/prisma/client";
import { UpdateBoardDto } from "./update-board.dto";
import { updateBoardDtoToPrismaData } from "./update-board-dto-to-prisma";

describe("updateBoardDtoToPrismaData", () => {
  it("maps name from a class-transformer DTO instance (rename flow)", () => {
    const dto = plainToInstance(UpdateBoardDto, { name: "Roadmap" });
    expect(updateBoardDtoToPrismaData(dto)).toEqual({ name: "Roadmap" });
  });

  it("returns an empty object when no fields are set", () => {
    const dto = plainToInstance(UpdateBoardDto, {});
    expect(updateBoardDtoToPrismaData(dto)).toEqual({});
  });

  it("maps multiple scalar fields", () => {
    const dto = plainToInstance(UpdateBoardDto, {
      name: "Sprint",
      starred: true,
      closed: false,
      backgroundBrightness: BoardBackgroundBrightness.dark,
    });
    expect(updateBoardDtoToPrismaData(dto)).toEqual({
      name: "Sprint",
      starred: true,
      closed: false,
      backgroundBrightness: BoardBackgroundBrightness.dark,
    });
  });

  /**
   * Regression: Prisma rejects `data` when it contains a function (e.g. passing
   * the raw Nest DTO instance). The mapper must only emit plain JSON values.
   */
  it("never puts functions on the Prisma payload (ignores stray own properties)", () => {
    const dto = plainToInstance(UpdateBoardDto, { name: "OK" });
    Object.assign(dto as Record<string, unknown>, {
      malicious: () => "evil",
    });
    const out = updateBoardDtoToPrismaData(dto);
    expect(out).toEqual({ name: "OK" });
    expect(Object.values(out).some((v) => typeof v === "function")).toBe(
      false,
    );
  });
});
