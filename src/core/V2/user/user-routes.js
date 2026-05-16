import BaseRoutes from "../../../base_classes/base-routes.js";
import tryCatch from "../../../utils/tryCatcher.js";
import AuthMiddleware from "../../../middlewares/auth-token-middleware.js";
import authorizeRoles from "../../../middlewares/authorize-role-middleware.js";
import validateCredentials from "../../../middlewares/validate-credentials-middleware.js";
import Role from "../../../common/enums/role.enum.js";
import userController from "./user-controller.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "./user-schema.js";

const onlyDireksi = authorizeRoles(Role.DIREKSI);

class UserRoutes extends BaseRoutes {
  routes() {
    // Read endpoints — semua user yang authenticated boleh akses
    this.router.get("/", [
      AuthMiddleware.authenticate,
      tryCatch(userController.List),
    ]);

    this.router.get("/lo-by-slo/:id", [
      AuthMiddleware.authenticate,
      tryCatch(userController.ListLoBySlo),
    ]);

    this.router.get("/slo-by-am/:id", [
      AuthMiddleware.authenticate,
      tryCatch(userController.ListSloByAm),
    ]);

    this.router.get("/:id", [
      AuthMiddleware.authenticate,
      tryCatch(userController.detail),
    ]);

    // Management endpoints — hanya Direksi
    this.router.post("/", [
      AuthMiddleware.authenticate,
      onlyDireksi,
      validateCredentials(createUserSchema),
      tryCatch(userController.create),
    ]);

    this.router.put("/:id", [
      AuthMiddleware.authenticate,
      onlyDireksi,
      validateCredentials(updateUserSchema),
      tryCatch(userController.update),
    ]);

    this.router.delete("/:id", [
      AuthMiddleware.authenticate,
      onlyDireksi,
      tryCatch(userController.remove),
    ]);

    this.router.patch("/:id/restore", [
      AuthMiddleware.authenticate,
      onlyDireksi,
      tryCatch(userController.restore),
    ]);

    this.router.patch("/:id/password", [
      AuthMiddleware.authenticate,
      onlyDireksi,
      validateCredentials(resetPasswordSchema),
      tryCatch(userController.resetPassword),
    ]);
  }
}

export default new UserRoutes().router;
