const jwt = require("jsonwebtoken");
const { APP_KEY , API_KEY} = process.env;
const {User} = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { userCanAccessPage } = require("../utils/pageAccess");

exports.authCheck = (req, res, next) => {
	const { authorization } = req.headers;
	if (authorization && authorization.startsWith("Bearer")) {
		const token = authorization.substr(7);
		try {
			const data = jwt.verify(token, APP_KEY);
			req.session_data = data;
			return next();
		} catch (error) {
			return status.ResponseStatus(res, 401, "Invalid token", error);
		}
	}
	return status.ResponseStatus(res, 401, "Authorization needed");
};

exports.authRole = (...roles) => {
	const allowedRoles = roles.flat();
	return async (req, res, next) => {
		try {
			const data = req.session_data;
			const foundUser = await User.findOne({
				where: { id: data.user_id, is_delete: 0 },
			});
			if (foundUser && allowedRoles.includes(foundUser.role)) {
				req.user = foundUser;
				return next();
			}
			return status.ResponseStatus(res, 403, "You don't have permission");
		} catch (error) {
			return status.ResponseStatus(res, 500, "Authorization error", error);
		}
	};
};

exports.authAdmin = exports.authRole(Role.Admin, Role.SuperAdmin);

exports.authPage = (page) => async (req, res, next) => {
	try {
		const data = req.session_data;
		const foundUser = await User.findOne({
			where: { id: data.user_id, is_delete: 0 },
		});
		if (foundUser && userCanAccessPage(foundUser, page)) {
			req.user = foundUser;
			return next();
		}
		return status.ResponseStatus(res, 403, "You don't have permission");
	} catch (error) {
		return status.ResponseStatus(res, 500, "Authorization error", error);
	}
};

exports.validateAPI = (req, res, next)=>{
	const { authorization } = req.headers;
	if (authorization && authorization.startsWith("Bearer")) {
		const token = authorization.substr(7);
		try {
			const data = jwt.verify(token, API_KEY);
			if (data) {
				req.session_data = data;
				return next();
			}
		} catch (error) {
			return status.ResponseStatus(res, 401, "Invalid token", error);
		}
	}
	return status.ResponseStatus(res, 401, "Authorization needed");
}