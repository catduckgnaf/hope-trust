import React from "react";
import { useDispatch  } from "react-redux";
import { ErrorBoundary } from "react-error-boundary"
import { clearAll } from "../store/actions/session";

export default function CustomErrorBoundary({ children, FallbackComponent, ...props }) {
  const dispatch = useDispatch();
  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onReset={(resetProps) => {
        dispatch(clearAll(resetProps));
      }}
      onError={(error, info) => {
        console.log("ERROR: ", error, info);
      }}>
      {children}
    </ErrorBoundary>
  );
}