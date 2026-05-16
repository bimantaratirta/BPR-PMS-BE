import BaseError from '../base_classes/base-error.js';

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(BaseError.forbidden('You are not allowed to access this resource'));
    }
    next();
  };

export default authorizeRoles;
