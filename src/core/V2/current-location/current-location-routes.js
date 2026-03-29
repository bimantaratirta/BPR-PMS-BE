import BaseRoutes from "../../../base_classes/base-routes.js";
import tryCatch from "../../../utils/tryCatcher.js";
import CurrentLocationController from "./current-location-controller.js";

// import validateCredentials from "../../middlewares/validate-credentials-middleware.js";

class CurrentLocationRoutes extends BaseRoutes {
  routes() {
    this.router.get("/", [tryCatch(CurrentLocationController.list)]);
    this.router.post("/request-all", [
      tryCatch(CurrentLocationController.requestAll),
    ]);
    this.router.get("/latest", [tryCatch(CurrentLocationController.latest)]);
    this.router.get("/:id", [tryCatch(CurrentLocationController.detail)]);
    this.router.put("/save-fcm-token", [
      tryCatch(CurrentLocationController.saveFcmToken),
    ]);
    this.router.post("/", [tryCatch(CurrentLocationController.create)]);
    this.router.delete("/:id", [tryCatch(CurrentLocationController.delete)]);
  }
}

export default new CurrentLocationRoutes().router;
