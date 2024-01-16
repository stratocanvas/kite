d// script.js
import io from 'socket.io-client';

document.addEventListener('DOMContentLoaded', async () => {
  await loadInventoryData();

  // WebSocket 연결
  const socket = io('http://localhost:3000'); // http 추가

  // WebSocket 메시지 수신 시 재고 다시 로드
  socket.addEventListener('message', async (event) => {
    if (event.data === 'InventoryUpdated') {
      await loadInventoryData();
    }
  });

  // 실시간으로 재고 데이터를 업데이트하는 함수
  setInterval(async () => {
    await loadInventoryData();
  }, 5000); // 5초마다 업데이트 (원하는 주기로 변경 가능)
});

  // 실시간으로 재고 데이터를 업데이트하는 함수
  async function loadInventoryData() {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
  
      // DOM에서 실제로 데이터를 표시하는 부분 추가
      const inventoryData = document.getElementById('inventoryData');
  
      // 요소가 존재하는 경우에만 내부의 HTML을 업데이트
      if (inventoryData) {
        inventoryData.textContent = JSON.stringify(data).replace(/[{}"]/g, '');
        // 또는 다음과 같이 각 항목을 줄바꿈하여 표시할 수도 있습니다.
        // inventoryData.textContent = JSON.stringify(data, null, 2);
      } else {
        console.error('Inventory Data not found.');
      }
  
      console.log('Current Inventory:', data);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    }
  }