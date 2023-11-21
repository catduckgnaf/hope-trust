import React from "react";
import {
  MultipartFormSidebar,
  SidebarContent,
  SidebarHeader,
} from "./layouts/split-layout.styles";

import {
  SidebarLogo,
  SidebarTitle,
  SidebarProgress,
  ProgressLevel,
} from "./elements.styles";

import LogoImage from "../../assets/images/logo-large.svg";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { FormContext } from "./MultipartForm";

export const MultipartDynamicSidebar = (props) => {
  const formState = useContext(FormContext);
  const { slides } = formState.config;
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  const steps_status = useSelector((state) => state.multi_part_form.steps_status);
  const allowed = slides.filter((slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers));

  return (
    <MultipartFormSidebar isVisible={false}>
      <SidebarHeader>
        <SidebarLogo src={LogoImage} alt="Hope Trust Logo" />
        <SidebarTitle>{slides[current_slide].title(formState.stateRetriever)}</SidebarTitle>
        {allowed.length > 1
          ? (
            <SidebarProgress>
              {allowed.map((_, index) => <ProgressLevel key={index} current={index === current_slide} completed={steps_status[_.id]} />)}
            </SidebarProgress>
          )
          : null
        }
      </SidebarHeader>
      <SidebarContent>
        {slides[current_slide].sidebar ? slides[current_slide].sidebar(formState.stateRetriever) : null}
      </SidebarContent>
    </MultipartFormSidebar>
  );
};