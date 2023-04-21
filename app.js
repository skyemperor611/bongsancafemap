//app.js

import { collection, getDocs } from "firebase/firestore";
import { db } from './firebase.js';
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from './firebase.js';

async function getDefaultImageURL() {
  const defaultImageRef = ref(storage, 'OIG.jfif');
  const defaultImageURL = await getDownloadURL(defaultImageRef);
  return defaultImageURL;
}

async function fetchData() {
  const cafesSnapshot = await getDocs(collection(db, "cafes"));
  const cafes = [];
  cafesSnapshot.forEach((doc) => {
    cafes.push({ id: doc.id, ...doc.data() });
  });
  return cafes;
}

function createCafeElement(cafe, defaultImageURL) {
  const li = document.createElement('li');
  li.classList.add('list-item');

  const img = document.createElement('img');
  img.setAttribute('src', cafe.image || defaultImageURL);
  img.setAttribute('width', '100');
  img.setAttribute('height', '100');

  const name = document.createElement('p');
  name.textContent = cafe.businessName;

  li.appendChild(img);
  li.appendChild(name);

  return li;
}

function createMap(cafes) {
    const bounds = new naver.maps.LatLngBounds(
      new naver.maps.LatLng(35.8611389,128.5929164),
      new naver.maps.LatLng(35.8683806,128.599774),
    );
    const mapOptions = {
        minZoom: 14, // 읍면동 레벨
        maxBounds: bounds,
    };
    const map = new naver.maps.Map('map', mapOptions);
  
    const infoWindow = new naver.maps.InfoWindow();
  
    cafes.forEach((cafe) => {
      const markerPosition = new naver.maps.LatLng(cafe.location._lat, cafe.location._long);
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: map,
        title: cafe.businessName
      });
  
      naver.maps.Event.addListener(marker, 'click', function() {
        infoWindow.setContent(cafe.businessName);
        infoWindow.open(map, marker);
      });
  
      naver.maps.Event.addListener(map, 'click', function() {
        infoWindow.close();
      });
  
      // marker 객체를 저장
      cafe.marker = marker;
    });
  
    map.fitBounds(bounds);
  
    return map;
  }
  
  async function displayCafesAndMap() {
    const cafes = await fetchData();
    cafes.sort((a, b) => a.businessName.localeCompare(b.businessName));
    const cafeList = document.getElementById('cafe-list');
    let infoWindow = null;
    
    const defaultImageURL = await getDefaultImageURL();

    cafes.forEach((cafe) => {
      const cafeElement = createCafeElement(cafe, defaultImageURL);
      cafeElement.addEventListener('click', function() {
        const markerPosition = new naver.maps.LatLng(cafe.location._lat, cafe.location._long);
        const map = createMap(cafes);
  
        // 지도 이동
        map.panTo(markerPosition);
  
        // 마커 클릭 이벤트 핸들러
        if (infoWindow) {
          infoWindow.close();
        }
        infoWindow = new naver.maps.InfoWindow();
        infoWindow.setContent(cafe.businessName);
        infoWindow.open(map, cafe.marker);
        
        // 클릭 이벤트 핸들러 등록
        naver.maps.Event.addListener(cafe.marker, 'click', function() {
          if (infoWindow) {
            infoWindow.close();
          }
          infoWindow = new naver.maps.InfoWindow();
          infoWindow.setContent(cafe.businessName);
          infoWindow.open(map, cafe.marker);
        });

        naver.maps.Event.addListener(map, 'click', function() {
            infoWindow.close();
          });
      
      });
      cafeList.appendChild(cafeElement);
    });

    const map = createMap(cafes);
  }

  displayCafesAndMap();
  
