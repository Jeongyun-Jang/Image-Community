import React from "react";

import {Button} from "../elements";
import {storage} from "./firebase";

import {useDispatch, useSelector} from "react-redux";
import {actionCreators as imageActions} from "../redux/modules/image";

const Upload = (props) => {
    const dispatch = useDispatch();
    const is_uploading = useSelector(state => state.image.uploading);//업로딩 중(true)인지 업로드 아닌 상태(flase)인지 확인해서 버튼 활성화 여부 판별 
    const fileInput = React.useRef();//게시글 작성 완료 btn은 onChange 시점이 아닌, 게시글 내용까지 작성 한 후이므로 file을 업로드하는 input에 나중에도 접근할 수 있어야한다.
                                     //So input에 접근하기 위해 Ref를 사용함

    const selectFile = (e) => {
        console.log(e);
        console.log(e.target);//input이 target으로 걸려 나옴
        console.log(e.target.files[0]);//FileList는 배열 처럼 보이지만 아님 FileList임 그리고 파일에 대한 정보가 Files에 담김

        console.log(fileInput.current.files[0]);//ref를 통해 Input에 잘 접근 됨
        //js의 fileleader를 이용하여 객체를 불러올 수 있다.
        const reader = new FileReader();
        const file = fileInput.current.files[0];//fileInput.current.files[0]가는 파일 하나이다.

        reader.readAsDataURL(file); //()괄호안에 읽고 싶은 객체를 넣어준다.

        reader.onloadend = () => { //onloadend는 읽기가 끝난후 실행됨
            console.log(reader.result);//읽은 파일의 내용물 log찍어보면 data;image/png ~~~하고 나올거다.
            dispatch(imageActions.setPreview(reader.result));
        }

    }

    const uploadFB = () => {
        let image = fileInput.current.files[0];//업로드할 이미지 준비
        dispatch(imageActions.uploadImageFB(image));
        const _upload = storage.ref(`image/${image.name}`).put(image);//ref()괄호 안에 파일경로, put은 업로드하는 firebase 내장 함수() 괄호안에 넣을 값
        
        /*//이부분을  Postwrite페이지에서도 보여주기 위해서 image.js로 옮겨줌 
        _upload.then((snapshot)=>{
            console.log(snapshot);

            snapshot.ref.getDownloadURL().then((url)=>{
                console.log(url);
            })
        })*/
    
    }

    return (
        <React.Fragment>
            <input type="file" onChange={selectFile} ref={fileInput} disabled={is_uploading}/> {/* is_uploading 상태에 맞게 true, false 값 넣어 비활성화/활성화 */}
            <Button _onClick={uploadFB}>업로드하기</Button>
        </React.Fragment>
    )
}

export default Upload;