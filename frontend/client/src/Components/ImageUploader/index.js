import React, { useState } from "react";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import ReactAvatar from "react-avatar";
import { Button, ViewContainer } from "../../global-components";
import { theme } from "../../global-styles";
import {
  Main,
  MainPadding,
  MainInner,
  MainInnerSection,
  Header,
  Message,
  FileTypesMessage
} from "./style";

const image_map = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/jpg": "JPG",
};

export const ImageUploader = (props) => {
  const [image, setImage] = useState(props.image);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!props.image);

  const onFileChange = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      (image_map[event.type] || "JPEG"),
      100,
      0,
      (uri) => {
        setImage(uri);
        setError("");
        setEditing(false);
        props.stateConsumer(props.collection_key, uri, props.controller);
      },
      "base64"
    );
  };

  const throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        setError("This file type is not supported.");
        break;
      case "maxsize":
        setError("Avatar must be less than 2MB");
        break;
      default:
        break;
    }
    setTimeout(() => setError(""), 5000);
  };

  return (
    <Main>
      <MainPadding>
        <MainInner>
          {props.header
            ? (
              <MainInnerSection span={12}>
                <Header>{props.header}</Header>
              </MainInnerSection>
            )
            : null
          }
          {props.message
            ? (
              <MainInnerSection span={12}>
                <Message>{props.message}</Message>
              </MainInnerSection>
            )
            : null
          }
          <MainInnerSection editing={editing ? 1 : 0} align="center" span={12}>
            {editing
              ? (
                <>
                  <ViewContainer style={{ position: "relative", margin: "auto", width: "275px", height: "275px", border: `2px dashed ${error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                    <AvatarImageCr
                      cancel={() => {
                        setImage("");
                        setEditing(false);
                        setError("");
                      }}
                      apply={(e) => onFileChange(e)}
                      isBack={false}
                      text={error ? error : "Drag a File or Click to Browse"}
                      errorHandler={(type) => throwAvatarError(type)}
                      iconStyle={{ marginBottom: "20px", width: "50px", height: "32px" }}
                      sliderConStyle={{ position: "relative", top: "auto", background: "transparent", height: "60px" }}
                      textStyle={{ fontSize: "12px" }}
                      maxsize={1024 * 1024 * 5}
                      actions={[
                        <Button hidden key={0} style={{ display: "none" }}></Button>,
                        <Button type="button" key={1} small green nomargin marginbottom={5}>Save Photo</Button>
                      ]}
                    />
                  </ViewContainer>
                </>
              )
              : (
                <>
                  <ReactAvatar style={{ marginBottom: "20px"}} src={image} size={200} round />
                  <FileTypesMessage>Max. 5 MB</FileTypesMessage>
                  <FileTypesMessage>JPG, PNG, JPEG formats</FileTypesMessage>
                  <FileTypesMessage>Recommended size 512 x 512</FileTypesMessage>
                  {image
                    ? <Button margintop={20} radius={4} blue type="button" onClick={() => {
                      setImage("");
                      setEditing(true);
                      props.stateConsumer(props.collection_key, "", props.controller);
                    }}>Remove</Button>
                    : null
                  }
                </>
              )
            }
          </MainInnerSection>
        </MainInner>
      </MainPadding>
    </Main>
  );
};
