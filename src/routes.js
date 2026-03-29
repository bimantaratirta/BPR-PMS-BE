import express from "express";

// V1
import AuthRoutes from "./core/V1/auth/auth-routes.js";
import KSSMRoutes from "./core/V1/KSSM/KSSM-routes.js";
import KSSRoutes from "./core/V1/KSS/KSS-routes.js";
import PINEKRoutes from "./core/V1/PINEK/PINEK-routes.js";
import FLEKSIRoutes from "./core/V1/FLEKSI/FLEKSI-routes.js";
import PROCIMRoutes from "./core/V1/PROCIM/PROCIM-routes.js";
import KSMRoutes from "./core/V1/KSM/KSM-routes.js";
import KMSMRoutes from "./core/V1/KMSM/KMSM-routes.js";
import KRSRoutes from "./core/V1/KRS/KRS-routes.js";
import KMMRoutes from "./core/V1/KMM/KMM-routes.js";
import KMSRoutes from "./core/V1/KMS/KMS-routes.js";
import KEFRoutes from "./core/V1/KEF/KEF-routes.js";
import KARRoutes from "./core/V1/KAR/KAR-routes.js";
import dashboardRoutes from "./core/V1/dashboard/dashboard-routes.js";

// V2
import AuthRoutesV2 from "./core/V2/auth/auth-routes.js";
import RegionV2 from "./core/V2/region/region-routes.js";
import BranchV2 from "./core/V2/branch/branch-routes.js";
import CustomerV2 from "./core/V2/customer/customer-routes.js";
import ReportV2 from "./core/V2/report/report-routes.js";
import ReviewCustomerV2 from "./core/V2/review-customer/review-customer-routes.js";
import EvaluationV2 from "./core/V2/evaluation/evaluation-routes.js";
import ReviewEvaluatonV2 from "./core/V2/review-evaluation/review-evaluation-routes.js";
import UserV2 from "./core/V2/user/user-routes.js";
import DashboardV2 from "./core/V2/dashboard/dashboard-routes.js";
import TestV2 from "./core/V2/test/test-routes.js";
import CurrentLocationRoutes from "./core/V2/current-location/current-location-routes.js";

const router = express.Router();

const appsRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/kssm",
    route: KSSMRoutes,
  },
  {
    path: "/kss",
    route: KSSRoutes,
  },
  {
    path: "/pinek",
    route: PINEKRoutes,
  },
  {
    path: "/fleksi",
    route: FLEKSIRoutes,
  },
  {
    path: "/procim",
    route: PROCIMRoutes,
  },
  {
    path: "/ksm",
    route: KSMRoutes,
  },
  {
    path: "/kmsm",
    route: KMSMRoutes,
  },
  {
    path: "/krs",
    route: KRSRoutes,
  },
  {
    path: "/kmm",
    route: KMMRoutes,
  },
  {
    path: "/kms",
    route: KMSRoutes,
  },
  {
    path: "/kef",
    route: KEFRoutes,
  },
  {
    path: "/kar",
    route: KARRoutes,
  },
  {
    path: "/dashboard",
    route: dashboardRoutes,
  },
];

const appsRoutesV2 = [
  {
    path: "/auth",
    route: AuthRoutesV2,
  },
  {
    path: "/region",
    route: RegionV2,
  },
  {
    path: "/branch",
    route: BranchV2,
  },
  {
    path: "/customer",
    route: CustomerV2,
  },
  {
    path: "/report",
    route: ReportV2,
  },
  {
    path: "/review-customer",
    route: ReviewCustomerV2,
  },
  {
    path: "/evaluation",
    route: EvaluationV2,
  },
  {
    path: "/review-evaluation",
    route: ReviewEvaluatonV2,
  },
  {
    path: "/user",
    route: UserV2,
  },
  {
    path: "/dashboard",
    route: DashboardV2,
  },
  {
    path: "/test",
    route: TestV2,
  },
  {
    path: "/current-location",
    route: CurrentLocationRoutes,
  },
];

appsRoutes.forEach(({ path, route }) => {
  router.use(`/v1${path}`, route);
});

appsRoutesV2.forEach(({ path, route }) => {
  router.use(`/v2${path}`, route);
});

export default router;
