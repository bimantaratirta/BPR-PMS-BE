import { createdResponse, successResponse, updatedResponse } from "../../../utils/response.js";
import currentLocationService from "./current-location-service.js";

class CurrentLocationController {
  async requestAll(req, res) {
    const result = await currentLocationService.requestLocationToAll();
    return successResponse(res, result);
  }

  async detail(req, res) {
    const { id } = req.params;
    const result = await currentLocationService.detail(id);
    return successResponse(res, result);
  }

  async list(req, res) {
    const query = req.query;
    const result = await currentLocationService.list({ query });

    return successResponse(
      res,
      result.data,
      "branch retrieved successfully",
      result.meta,
    );
  }

  async latest() {
    const result = await currentLocationService.latest();
    return successResponse(res, result.data);
  }

  async saveFcmToken(req, res) {
    const result = await currentLocationService.saveFcmToken(req.body);
    return updatedResponse(res, result);
  }

  async create(req, res) {
    const result = await currentLocationService.create(req.body);
    return createdResponse(res, result);
  }

  async delete(req, res) {
    const { id } = req.params;
    const result = await currentLocationService.delete(id);
    return successResponse(res, result);
  }
}

export default new CurrentLocationController();
