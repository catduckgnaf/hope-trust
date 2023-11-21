import React, { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "../../global-components";
import configGlobal from "../../config";
import { getPlaidLinkToken } from "../../store/actions/plaid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch } from "react-redux";

const PlaidButton = (props) => {
  const [isBusy, setBusy] = useState(true);
  const [link_token, setToken] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    getToken();
    // eslint-disable-next-line
  }, []);

  const getToken = async () => {
    setBusy(true);
    const linked = await getPlaidLinkToken(props.user, configGlobal.plaid.WEBHOOK_URL, props.access_token);
    setToken(linked);
    setBusy(false);
  };

  const onSuccess = useCallback(
    (token, metadata) => props.onSuccess(token, metadata, dispatch), [props, dispatch]
  );
  const { open, ready, error } = usePlaidLink({ token: link_token, onSuccess });
  const disabled = (!ready || error || props.disabled);
  return (
    <>
      {!isBusy
        ? (
          <>
            {props.Component
              ? props.Component(open, disabled)
              : <Button
                  small={props.widget ? 1 : 0}
                  nomargin
                  marginleft={10}
                  green
                  type="button"
                  onClick={() => open()}
                  disabled={disabled}>
                  Link Accounts
                </Button>
            }
          </>
        )
        : <FontAwesomeIcon icon={["far", "spinner"]} spin />
      }
    </>
  );
};

export default PlaidButton;