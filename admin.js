import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  // 여기에 Firebase 프로젝트의 구성 객체를 붙여넣으세요.
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cafeId = document.getElementById('cafe-id').value;
    const imageFile = document.getElementById('image').files[0];

    if (!cafeId || !imageFile) {
        alert('카페 ID와 이미지를 입력해주세요.');
        return;
    }

    try {
        // 이미지를 Firebase Storage에 업로드
        const imagePath = `cafes/${cafeId}/${imageFile.name}`;
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, imageFile);

        // 업로드된 이미지의 다운로드 URL을 가져옴
        const imageURL = await getDownloadURL(imageRef);

        // Firestore에서 카페를 찾아 이미지 URL 업데이트
        const cafeRef = doc(db, 'cafes', cafeId);
        await updateDoc(cafeRef, { image: imageURL });

        alert('이미지가 업로드되었습니다.');
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('이미지 업로드에 실패하였습니다. 다시 시도해주세요.');
    }
});
