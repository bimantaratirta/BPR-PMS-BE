import joi from "joi";
import BaseError from "../../../base_classes/base-error.js";
import { PrismaService } from "../../../common/service/prisma.service.js";
import { buildQueryOptions } from "../../../utils/buildQueryOptions.js";
import { firebase } from "../../../utils/firebase.js";

// optional kalau kamu punya query config
// import currentLocationQueryConfig from './current-location-query-config.js';

class CurrentLocationService {
  constructor() {
    this.prisma = new PrismaService();
  }

  async requestLocationToAll() {
    const users = await this.prisma.user.findMany({
      where: { fcm_token: { not: null } },
    });

    const tokens = users.map((u) => u.fcm_token);

    if (!tokens.length) {
      return { message: "No devices available" };
    }

    await firebase.messaging().sendEachForMulticast({
      tokens,
      data: {
        type: "REQUEST_LOCATION",
      },
    });

    return { message: "Request location sent successfully" };
  }

  async saveFcmToken(data) {
    let validation = "";
    let stack = [];

    const fail = (message, path) => {
      validation += (validation ? " " : "") + message;
      stack.push({ message, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.user_id },
      });

      if (!user) {
        fail("User not found", "user_id");
        throw new joi.ValidationError(validation, stack);
      }

      if (!data.fcm_token) {
        fail("FCM token is required", "fcm_token");
        throw new joi.ValidationError(validation, stack);
      }

      const updated = await tx.user.update({
        where: { id: data.user_id },
        data: {
          fcm_token: data.fcm_token,
        },
      });

      if (!updated) throw Error("Failed to save FCM token");

      return {
        message: "FCM token saved successfully",
        data: updated,
      };
    });
  }

  async create(data) {
    let validation = "";
    let stack = [];

    const fail = (message, path) => {
      validation += (validation ? " " : "") + message;
      stack.push({ message, path: [path] });
    };

    return this.prisma.$transaction(async (tx) => {
      // validasi user
      const userExists = await tx.user.findUnique({
        where: { id: data.user_id },
      });

      if (!userExists) {
        fail("User not found", "user_id");
        throw new joi.ValidationError(validation, stack);
      }

      const created = await tx.currentLocation.create({
        data: {
          user_id: data.user_id,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });

      if (!created) throw Error("Failed to save location");

      return { message: "Location saved successfully", data: created };
    });
  }

  async list({ query } = {}) {
    // kalau belum punya config, bisa langsung pakai default
    const options = buildQueryOptions({}, query);

    const [data, count] = await Promise.all([
      this.prisma.currentLocation.findMany({
        ...options,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.currentLocation.count({ where: options.where }),
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

  async latest() {
    // ambil lokasi terakhir tiap user
    const locations = await this.prisma.currentLocation.findMany({
      orderBy: { created_at: "desc" },
      distinct: ["user_id"],
    });

    return { data: locations };
  }

  async detail(id) {
    const location = await this.prisma.currentLocation.findUnique({
      where: { id },
    });

    if (!location) throw BaseError.notFound("Location not found");

    return { data: location };
  }

  async remove(id) {
    const deleted = await this.prisma.currentLocation.delete({
      where: { id },
    });

    return { message: "Location deleted successfully", data: deleted };
  }
}

export default new CurrentLocationService();
