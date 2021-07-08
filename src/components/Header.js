import React from "react";
import { Grid, Text, Button } from "../elements";
import { getCookie, deleteCookie } from "../shared/Cookie";

//header에서 스토어 값 보기 위함
import { useSelector, useDispatch } from "react-redux";
import { actionCreators as userActions } from "../redux/modules/user"; 
import { history } from "../redux/configureStore";
import { apiKey } from "../shared/firebase";

import NotiBadge from "./NotiBadge"; //알림

const Header = (props) => {
  const dispatch = useDispatch();
  const is_login = useSelector((state) => state.user.is_login);

  const _session_key = `firebase:authUser:${apiKey}:[DEFAULT]`;

  const is_session = sessionStorage.getItem(_session_key)? true : false;
  
  console.log(is_session);

  if (is_login && is_session) {
    return (
      <React.Fragment>
        <Grid is_flex padding="4px 16px"//is_flex는 horizintal 가로 배치를 말한다.
        > 
          <Grid>
            <Text margin="0px" size="24px" bold>
              헬로
            </Text>
          </Grid>

          <Grid is_flex>
            <Button text="내정보"></Button>
            
            <NotiBadge _onClick={() => { // _onClick이 NotiBadge에서 props로 넘어온다.
              history.push("/noti");
            }}
            />
            <Button
              text="로그아웃"
              _onClick={() => {
                dispatch(userActions.logoutFB());
              }}
            ></Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Grid is_flex padding="4px 16px">
        <Grid>
          <Text margin="0px" size="24px" bold>
            헬로
          </Text>
        </Grid>

        <Grid is_flex>
          <Button
            text="로그인"
            _onClick={() => {
              history.push("/login");
            }}
          ></Button>
          <Button
            text="회원가입"
            _onClick={() => {
              history.push("/signup");
            }}
          ></Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

Header.defaultProps = {};

export default Header;
