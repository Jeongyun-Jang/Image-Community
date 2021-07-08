//storage에 이미지 업로드
import {createAction, handleActions} from "redux-actions";
import produce from "immer";

import {storage} from "../../shared/firebase";

//action type
const UPLOADING = "UPLOADING";
const UPLOAD_IMAGE = "UPLOAD_IMAGE";
const SET_PREVIEW = "SET_PREVIEW";

//action creator
const uploading = createAction(UPLOADING, (uploading) => ({uploading})); //업로드 중인지 체크
const uploadImage = createAction(UPLOAD_IMAGE, (image_url) => ({image_url})); //업로드한 이미지의 url을 받아다가 저장해놓음
const setPreview = createAction(SET_PREVIEW, (preview) => ({preview}));//preview Img

const initialState = {
    image_url: '',
    uploading: false,
    preview: null,
}

const uploadImageFB = (image) => {
    return function(dispatch, getState, {history}){
        //업로딩을 시작하면 uploading을 true로 변경
        dispatch(uploading(true));

         const _upload = storage.ref(`images/${image.name}`).put(image);

         _upload.then((snapshot) => {//파일 업로드
           console.log(snapshot);
          
           snapshot.ref.getDownloadURL().then((url) => {
              dispatch(uploadImage(url));
              console.log(url);
           });
         });

    }
}

export default handleActions({
    [UPLOAD_IMAGE]: (state, action) => produce(state, (draft) => {
        draft.image_url = action.payload.image_url;//action으로 넘어온 image_url을 변경해 이미지 URL 변경
        draft.uploading = false;//업로딩 끝났으니 true에서 false로 변경
    }),
    [UPLOADING]: (state, action) => produce(state, (draft) => {
        draft.uploading = action.payload.uploading; //action으로 넘어온 uploading을 적용
    }),
    [SET_PREVIEW]: (state, action) => produce(state, (draft) => {
      draft.preview = action.payload.preview;//action으로 넘어온 preview을 적용
    })
}, initialState);

const actionCreators = {
  uploadImage,
  uploadImageFB,
  setPreview,
  //uploading은 upload할 때 이 안에서만 실행되는 모듈이므로 export해줄 필요 x
};

export {actionCreators};

