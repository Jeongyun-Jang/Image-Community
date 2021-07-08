import React from "react";
import { Badge } from "@material-ui/core"; //material-ui 사용 준비
import NotificationsIcon from "@material-ui/icons/Notifications"; //알림 뱃지 icon 가져오기

import { realtime } from "../shared/firebase"; //on / off로 구독여부
import { useSelector } from "react-redux"; //for user_id 가지고 오기 위함 리덕스에 있으므로

const NotiBadge = (props) => {
  const [is_read, setIsRead] = React.useState(true);//읽은 상태 true로 두기
  const user_id = useSelector((state) => state.user.user.uid);
  const notiCheck = () => {//Badge 컴포넌트 클릭하면 실행할 함수
    const notiDB = realtime.ref(`noti/${user_id}`);
    notiDB.update({read: true}); //읽었으니 상태를 false에서 true로 변경해 불 안들어오게
    props._onClick();
  };


  React.useEffect(() => { //함수형 컨포넌트에서 리스터 구독할 때 useEffect에서 처리
    const notiDB = realtime.ref(`noti/${user_id}`); //realtime에서 ref로 

    notiDB.on("value", (snapshot) => { //구독 on()괄호 안에 첫번째 파라미터는 value: 데이터 가지고 오기, 두번째 파라미터는 값(snapshot) 바뀌었을 때 어떻게 동작할지 
      console.log(snapshot.val());//firestore에서 doc.data()로 값 가지고 왔다면 realtime에서는 snapshot.val()로 가지고 온다.
      //출력해보면 {read: false} or {read: true}로 출력
      setIsRead(true); //???????????????????아래가 null 값이 들어가 오류나서 임시로 이렇게 지정 확인 필요
      //setIsRead(snapshot.val().read);//읽은 true면 알림 불 안켜짐 / false면 알림 불 켜짐 
    });

    return () => notiDB.off(); //항상 구독했으면 해제도 진행 on/off가 한세트
  }, []); //Mount 되었을 당시 notiDB 한번 구독, 완전히 사라졌을 때 없앰

  return (
    <React.Fragment>
      <Badge
        color="secondary"
        variant="dot"
        invisible={is_read}
        onClick={notiCheck}
      >
        <NotificationsIcon /> {/* icon 보여주기 */}
      </Badge>
    </React.Fragment>
  );
};

NotiBadge.defaultProps = { //Header에서 NotiBadge쓰일 때 _onClick이 NotiBadge 컴포넌트에서 props로 넘어간다.
  _onClick: () => {},
};

export default NotiBadge;
