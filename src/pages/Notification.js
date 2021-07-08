import React from "react";
import { Grid, Text, Image } from "../elements";
import Card from "../components/Card";

import { realtime } from "../shared/firebase";
import { useSelector } from "react-redux"; // 어느사람의 알림을 가져올건지 알기 위해

const Notification = (props) => {
  const user = useSelector(state => state.user.user);
  const [noti, setNoti] = React.useState([]);
/*//알림 목록 잘 뜨는지 테스트
  let noti = [
    {user_name: "aaaa", post_id: "post1", image_url:""},
    {user_name: "aaaa", post_id: "post2", image_url:""},
    {user_name: "aaaa", post_id: "post3", image_url:""},
    ]
*/
  React.useEffect(() => {//왜 사용?
    if(!user){//user정보가 없으면 realtime에서 data 찾을 수 없음 ( realtime.ref에서 user.uid로 값을 찾으니까 )
      return;
    }

    const notiDB = realtime.ref(`noti/${user.uid}/list`); // realtime ?

    const _noti = notiDB.orderByChild("insert_dt");// realtimeDB에서는 orderByChild로 데이터 정렬 함수 사용 오름차순으로 가져온다. orderByChild함수로는 desc못 함

    _noti.once("value", snapshot => { //?
      if(snapshot.exists()){//exist를 이용해 snapshot있는지 확인
        let _data = snapshot.val();

        let _noti_list = Object.keys(_data).reverse().map(s => {//오름차순 배열 내림차순으로 변경
          return _data[s];
        })

        console.log(_noti_list);
        setNoti(_noti_list);
      }
    })


  }, [user]);
  
  return (
    <React.Fragment>
      <Grid padding="16px" bg="#EFF6FF">{/* 배경색 파란색 */}
        {noti.map((n, idx) => {//map돌릴 때는 꼭 key 넣는다
          return <Card key={`noti_${idx}`} {...n} />;
        })}
      </Grid>
    </React.Fragment>
  );
};

export default Notification;
