import React from "react";
import { Outlet } from "react-router";

const ValidateRoute = () => {
  return <div>{<Outlet />}</div>;
};

export default ValidateRoute;
