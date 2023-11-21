import React from "react";
import {
  Main,
  Padding,
  Inner,
  InnerSection,
  InnerSectionHeader,
  Hint
} from "./style";
import { useDispatch } from "react-redux";
import { Button } from "../../global-components";
import authenticated from "../../store/actions/authentication";

export default function GenericError({ error, resetErrorBoundary }) {
  const dispatch = useDispatch();
  return (
    <Main>
      <Padding>
        <Inner gutter={20}>
          <InnerSection span={12}>
            <InnerSectionHeader>An error occurred.</InnerSectionHeader>
            <Hint>Something went wrong. Please refresh. {error.message}</Hint>
          </InnerSection>
          <InnerSection span={12}>
            <Button blue onClick={() => resetErrorBoundary()}>Retry</Button>
            <Button blue onClick={() => dispatch(authenticated.logOut())}>Logout</Button>
          </InnerSection>
        </Inner>
      </Padding>
    </Main>
  )
}