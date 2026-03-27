import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/httpError";
import { AdminRole } from "../types";
interface AuthMatch {
  login: string;
  password: string;
  role: AdminRole;
}
const authMatrix: AuthMatch[] = [{
  login: env.adminOperatorLogin,
  password: env.adminOperatorPassword,
  role: "operator"
}, {
  login: env.adminViewerLogin,
  password: env.adminViewerPassword,
  role: "viewer"
}];
export const loginAdmin = (login: string, password: string): {
  token: string;
  role: AdminRole;
} => {
  const matched = authMatrix.find(candidate => candidate.login === login && candidate.password === password);
  if (!matched) {
    throw new UnauthorizedError("Invalid credentials");
  }
  return {
    token: jwt.sign({
      sub: login,
      role: matched.role
    }, env.jwtSecret, {
      expiresIn: "12h"
    }),
    role: matched.role
  };
};
