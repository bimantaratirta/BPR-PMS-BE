import { successResponse, createdResponse } from "../../../utils/response.js";
import userService from "./user-service.js";

class UserController {
  async List(req, res) {
    const query = req.query;
    const result = await userService.list({ query, requester: req.user });
    return successResponse(
      res,
      result.data,
      "User retrieved successfully",
      result.meta
    );
  }

  async detail(req, res) {
    const result = await userService.detail(req.params.id);
    return successResponse(res, result, "User detail retrieved");
  }

  async ListLoBySlo(req, res) {
    const query = req.query;
    const result = await userService.ListLoBySlo(req.params.id, { query });
    return successResponse(
      res,
      result.data,
      "User retrieved successfully",
      result.meta
    );
  }

  async ListSloByAm(req, res) {
    const query = req.query;
    const result = await userService.ListSloByAm(req.params.id, { query });
    return successResponse(
      res,
      result.data,
      "User retrieved successfully",
      result.meta
    );
  }

  async create(req, res) {
    const result = await userService.create(req.body);
    return createdResponse(res, result.data, result.message);
  }

  async update(req, res) {
    const result = await userService.update(req.params.id, req.body);
    return successResponse(res, result.data, result.message);
  }

  async remove(req, res) {
    const result = await userService.remove(req.params.id);
    return successResponse(res, result.data, result.message);
  }

  async restore(req, res) {
    const result = await userService.restore(req.params.id);
    return successResponse(res, result.data, result.message);
  }

  async resetPassword(req, res) {
    const result = await userService.resetPassword(req.params.id, req.body.password);
    return successResponse(res, null, result.message);
  }
}

export default new UserController();
