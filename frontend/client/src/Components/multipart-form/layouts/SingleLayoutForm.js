import React, { useContext } from "react";
import { FormContext } from "../MultipartForm";
import { useDispatch, useSelector } from "react-redux";
import * as Single from "./single-layout.styles";
import {
  ProgressLevel, SidebarLogo,
} from "../elements.styles";
import ReactAvatar from "react-avatar";
import { MultipartDynamicForm } from "../form/MultipartDynamicForm";
import LogoImage from "../../../assets/images/logo-large.svg";

export const SingleLayout = () => {
  const formState = useContext(FormContext);
  const { slides, banner, banner_text } = formState.config;
  const dispatch = useDispatch();
  let current_slide = useSelector((state) => state.multi_part_form.slide);
  if (!slides[current_slide]) current_slide = 0;
  let benefits_config = useSelector((state) => state.user.benefits_client_config);
  const steps_status = useSelector((state) => state.multi_part_form.steps_status);
  const allowed = slides.filter((slide) => slide.lifecycle.shouldRender(formState.stateRetriever, formState.helpers));

  return (
    <Single.MultipartFormWrapper>
      <Single.MultipartFormBody>
        {banner
          ? <Single.MultipartFormBanner>{banner_text}</Single.MultipartFormBanner>
          : null
        }
        <Single.MultipartFormHeader banner={banner ? 1 : 0}>
          {benefits_config
            ? <ReactAvatar src={benefits_config ? benefits_config.logo : null} size={120} name={benefits_config ? benefits_config.name : null} round />
            : <SidebarLogo src={LogoImage} />
          }
          <Single.MultipartFormTitle>{slides[current_slide].title(formState.stateRetriever, formState.helpers)}</Single.MultipartFormTitle>
          {allowed.length > 1
            ? (
              <Single.Progress>
                {allowed.map((_, index) => <ProgressLevel key={index} current={_.index === current_slide} completed={steps_status[_.id]} />)}
              </Single.Progress>
            )
            : null
          }
          {slides[current_slide].secondaryCta
            ? <Single.FormSecondaryCTA banner={banner ? 1 : 0} position={slides[current_slide].secondaryCta.position} onClick={() => {
              if (slides[current_slide].secondaryCta.action) dispatch(slides[current_slide].secondaryCta.action(formState.stateRetriever, formState.helpers));
              if (slides[current_slide].secondaryCta.helper) slides[current_slide].secondaryCta.helper(formState.stateRetriever, formState.helpers);
            }}>{slides[current_slide].secondaryCta.label}</Single.FormSecondaryCTA>
            : null
          }
          {slides[current_slide].subtitle ? slides[current_slide].subtitle(formState.stateRetriever) : null}
        </Single.MultipartFormHeader>
        <MultipartDynamicForm />
      </Single.MultipartFormBody>
    </Single.MultipartFormWrapper>
  );
};