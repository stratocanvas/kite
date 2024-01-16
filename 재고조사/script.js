// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  // WebSocket 연결
  const socket = new WebSocket('ws://localhost:3000');

  // WebSocket이 연결되었을 때의 이벤트 처리
  socket.addEventListener('open', (event) => {
    console.log('WebSocket 연결 성공');
  });

  const goToManagementPageButton = document.getElementById('goToManagementPageButton');

  if (goToManagementPageButton) {
    goToManagementPageButton.addEventListener('click', () => {
      // 관리자 페이지로 이동
      window.location.href = '/management.html';
    });
  } else {
    console.error('Go to Management Page button not found.');
  }

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
      inventoryData.innerHTML = '';

      for (const product in data) {
        const quantity = data[product];
        const productElement = document.createElement('div');
        productElement.textContent = `${product}: ${quantity}`;
        inventoryData.appendChild(productElement);
      }

    } else {
      console.error('Inventory Data not found.');
    }

    console.log('Current Inventory:', data);
  } catch (error) {
    console.error('Error loading inventory data:', error);
  }
}