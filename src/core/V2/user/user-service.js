import joi from "joi";
import BaseError from "../../../base_classes/base-error.js";
import { PrismaService } from "../../../common/service/prisma.service.js";
import { buildQueryOptions } from "../../../utils/buildQueryOptions.js";
import { hashPassword } from "../../../utils/passwordConfig.js";
import Role from "../../../common/enums/role.enum.js";
import db from "../../../config/db.js";
import userQueryConfig from "./user-query-config.js";

const USER_SELECT = {
  id: true,
  name: true,
  username: true,
  role: true,
  region_id: true,
  branch_id: true,
  supervisor_id: true,
  region: true,
  branch: true,
  supervisor: { select: { id: true, name: true } },
  created_at: true,
  updated_at: true,
  deleted_at: true,
};

class UserService {
  constructor() {
    this.prisma = new PrismaService();
  }

  async list({ query, requester } = {}) {
    const requestedDeleted =
      query?.include_deleted === true || query?.include_deleted === "true";
    const includeDeleted = requestedDeleted && requester?.role === Role.DIREKSI;
    const options = buildQueryOptions(userQueryConfig, query, null);

    // db = raw PrismaClient tanpa soft-delete middleware → bisa lihat semua.
    // this.prisma = PrismaService dgn middleware → otomatis filter deleted_at: null.
    const client = includeDeleted ? db : this.prisma;

    const [data, count] = await Promise.all([
      client.user.findMany(options),
      client.user.count({ where: options.where }),
    ]);

    const page = query?.pagination?.page ?? 1;
    const limit = query?.pagination?.limit ?? 10;
    const hasPagination = !!(query?.pagination && !query?.get_all);
    const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

    return {
      data,
      meta: hasPagination
        ? {
            totalItems: count,
            totalPages,
            currentPage: Number(page),
            itemsPerPage: Number(limit),
          }
        : null,
    };
  }

  async detail(id) {
    const item = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!item) throw BaseError.notFound("User not found");

    return item;
  }

  async ListLoBySlo(id, { query } = {}) {
    const options = buildQueryOptions(userQueryConfig, query, {
      role: Role.LO,
      supervisor_id: id,
    });

    const [data, count] = await Promise.all([
      this.prisma.user.findMany(options),
      this.prisma.user.count({ where: options.where }),
    ]);

    if (data.length === 0) throw BaseError.notFound("LO not found");

    const page = query?.pagination?.page ?? 1;
    const limit = query?.pagination?.limit ?? 10;
    const hasPagination = !!(query?.pagination && !query?.get_all);
    const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

    return {
      data,
      meta: hasPagination
        ? {
            totalItems: count,
            totalPages,
            currentPage: Number(page),
            itemsPerPage: Number(limit),
          }
        : null,
    };
  }

  async ListSloByAm(id, { query } = {}) {
    const options = buildQueryOptions(userQueryConfig, query, {
      role: Role.SLO,
      supervisor_id: id,
    });

    const [data, count] = await Promise.all([
      this.prisma.user.findMany(options),
      this.prisma.user.count({ where: options.where }),
    ]);

    if (data.length === 0) throw BaseError.notFound("SLO not found");

    const page = query?.pagination?.page ?? 1;
    const limit = query?.pagination?.limit ?? 10;
    const hasPagination = !!(query?.pagination && !query?.get_all);
    const totalPages = hasPagination ? Math.ceil(count / limit) : 1;

    return {
      data,
      meta: hasPagination
        ? {
            totalItems: count,
            totalPages,
            currentPage: Number(page),
            itemsPerPage: Number(limit),
          }
        : null,
    };
  }

  async create(data) {
    let validation = "";
    const stack = [];
    const fail = (message, path) => {
      validation += (validation ? " " : "") + message;
      stack.push({ message, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      const usernameExist = await tx.user.findFirst({
        where: { username: data.username },
      });
      if (usernameExist) {
        fail("Username already taken.", "username");
        throw new joi.ValidationError(validation, stack);
      }

      const resolved = await this._resolveHierarchy(tx, data.role, {
        region_id: data.region_id,
        branch_id: data.branch_id,
      });
      if (resolved.error) {
        fail(resolved.error.message, resolved.error.path);
        throw new joi.ValidationError(validation, stack);
      }

      const hashedPassword = await hashPassword(data.password);

      const created = await tx.user.create({
        data: {
          name: data.name,
          username: data.username,
          password: hashedPassword,
          role: data.role,
          region_id: resolved.region_id,
          branch_id: resolved.branch_id,
          supervisor_id: resolved.supervisor_id,
        },
        select: USER_SELECT,
      });

      return { message: "User created successfully", data: created };
    });
  }

  async update(id, data) {
    let validation = "";
    const stack = [];
    const fail = (message, path) => {
      validation += (validation ? " " : "") + message;
      stack.push({ message, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({ where: { id } });
      if (!current) throw BaseError.notFound("User not found");

      const updated = {};

      if (data.username && data.username !== current.username) {
        const usernameExist = await tx.user.findFirst({
          where: { username: data.username, NOT: { id } },
        });
        if (usernameExist) {
          fail("Username already taken.", "username");
          throw new joi.ValidationError(validation, stack);
        }
        updated.username = data.username;
      }

      if (data.name !== undefined) updated.name = data.name;

      const hierarchyTouched =
        data.role !== undefined ||
        data.region_id !== undefined ||
        data.branch_id !== undefined;

      if (hierarchyTouched) {
        const nextRole = data.role ?? current.role;
        const nextRegionId =
          data.region_id !== undefined ? data.region_id || null : current.region_id;
        const nextBranchId =
          data.branch_id !== undefined ? data.branch_id || null : current.branch_id;

        const resolved = await this._resolveHierarchy(
          tx,
          nextRole,
          { region_id: nextRegionId, branch_id: nextBranchId },
          { excludeUserId: id }
        );
        if (resolved.error) {
          fail(resolved.error.message, resolved.error.path);
          throw new joi.ValidationError(validation, stack);
        }

        updated.role = nextRole;
        updated.region_id = resolved.region_id;
        updated.branch_id = resolved.branch_id;
        updated.supervisor_id = resolved.supervisor_id;
      }

      const result = await tx.user.update({
        where: { id },
        data: updated,
        select: USER_SELECT,
      });

      return { message: "User updated successfully", data: result };
    });
  }

  async remove(id) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) throw BaseError.notFound("User not found");

    const subordinateCount = await this.prisma.user.count({
      where: { supervisor_id: id },
    });
    if (subordinateCount > 0) {
      throw BaseError.duplicate(
        `Cannot delete: user still has ${subordinateCount} active subordinate(s). Reassign them first.`
      );
    }

    // Soft delete via prisma-soft-delete-middleware: .delete() jadi set deleted_at = now()
    const deleted = await this.prisma.user.delete({
      where: { id },
      select: USER_SELECT,
    });

    return { message: "User deleted successfully", data: deleted };
  }

  async restore(id) {
    // Pakai `db` (raw PrismaClient) supaya bisa baca user yg soft-deleted.
    const current = await db.user.findUnique({ where: { id } });
    if (!current) throw BaseError.notFound("User not found");
    if (!current.deleted_at) {
      throw BaseError.badRequest("User is already active");
    }

    let validation = "";
    const stack = [];
    const fail = (message, path) => {
      validation += (validation ? " " : "") + message;
      stack.push({ message, path: [path] });
    };

    // Re-check constraint unik thd user aktif yg lain.
    if (current.role === Role.AM && current.region_id) {
      const dupAM = await this.prisma.user.findFirst({
        where: { role: Role.AM, region_id: current.region_id, NOT: { id } },
      });
      if (dupAM) {
        fail("Region has already been assigned to another AM", "region_id");
        throw new joi.ValidationError(validation, stack);
      }
    }
    if (current.role === Role.SLO && current.branch_id) {
      const dupSLO = await this.prisma.user.findFirst({
        where: { role: Role.SLO, branch_id: current.branch_id, NOT: { id } },
      });
      if (dupSLO) {
        fail("Branch has already been assigned to another SLO", "branch_id");
        throw new joi.ValidationError(validation, stack);
      }
    }

    const restored = await db.user.update({
      where: { id },
      data: { deleted_at: null },
      select: USER_SELECT,
    });

    return { message: "User restored successfully", data: restored };
  }

  async resetPassword(id, password) {
    const current = await this.prisma.user.findUnique({ where: { id } });
    if (!current) throw BaseError.notFound("User not found");

    const hashed = await hashPassword(password);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return { message: "Password reset successfully" };
  }

  /**
   * Validasi + resolve region/branch/supervisor berdasar role.
   * Konsisten dgn aturan di auth-service.register.
   * @param {import('@prisma/client').Prisma.TransactionClient} tx
   * @param {string} role
   * @param {{region_id?: string|null, branch_id?: string|null}} input
   * @param {{excludeUserId?: string}} opts — untuk update, exclude diri sendiri saat cek unik.
   */
  async _resolveHierarchy(tx, role, input, opts = {}) {
    const { region_id, branch_id } = input;
    const excludeUserId = opts.excludeUserId;
    const notSelf = excludeUserId ? { NOT: { id: excludeUserId } } : {};

    if (role === Role.DIREKSI) {
      return { region_id: null, branch_id: null, supervisor_id: null };
    }

    if (role === Role.PIC) {
      return {
        region_id: region_id || null,
        branch_id: branch_id || null,
        supervisor_id: null,
      };
    }

    if (role === Role.AM) {
      if (!region_id) {
        return { error: { message: "region_id is required for AM", path: "region_id" } };
      }
      const dupAM = await tx.user.findFirst({
        where: { role: Role.AM, region_id, ...notSelf },
      });
      if (dupAM) {
        return {
          error: { message: "Region has already been assigned to another AM", path: "region_id" },
        };
      }
      return { region_id, branch_id: null, supervisor_id: null };
    }

    if (role === Role.SLO) {
      if (!branch_id) {
        return { error: { message: "branch_id is required for SLO", path: "branch_id" } };
      }
      const dupSLO = await tx.user.findFirst({
        where: { role: Role.SLO, branch_id, ...notSelf },
      });
      if (dupSLO) {
        return {
          error: { message: "Branch has already been assigned to another SLO", path: "branch_id" },
        };
      }
      const branch = await tx.branch.findUnique({ where: { id: branch_id } });
      if (!branch) {
        return { error: { message: "Branch does not exist", path: "branch_id" } };
      }
      const am = await tx.user.findFirst({
        where: { role: Role.AM, region_id: branch.region_id },
      });
      if (!am) {
        return {
          error: { message: "No AM supervisor found for the given region", path: "supervisor_id" },
        };
      }
      return { region_id: null, branch_id, supervisor_id: am.id };
    }

    if (role === Role.LO) {
      if (!branch_id) {
        return { error: { message: "branch_id is required for LO", path: "branch_id" } };
      }
      const branch = await tx.branch.findUnique({ where: { id: branch_id } });
      if (!branch) {
        return { error: { message: "Branch does not exist", path: "branch_id" } };
      }
      const slo = await tx.user.findFirst({
        where: { role: Role.SLO, branch_id },
      });
      if (!slo) {
        return {
          error: { message: "No SLO supervisor found for the given branch", path: "supervisor_id" },
        };
      }
      return { region_id: null, branch_id, supervisor_id: slo.id };
    }

    return { error: { message: "Invalid role", path: "role" } };
  }
}

export default new UserService();
