'use client';

import { useEffect } from 'react';

export default function ConsoleWarning() {
  useEffect(() => {
    const warningMessages = [
      { message: `

 ███████ ████████  ██████  ██████  
 ██         ██    ██    ██ ██   ██ 
 ███████    ██    ██    ██ ██████  
      ██    ██    ██    ██ ██      
 ███████    ██     ██████  ██      
                                                                           
`, style: 'color: red; font-size: 12px font-weight:bold;' },
      { message: '누가 여기에 무언가를 입력하거나 붙여넣으라고 시켰다면', style: 'color: white; font-size: 16px;' },
      { message: '당장 이 창을 닫으십시오.', style: 'color: white; font-size: 16px;' },
      { message: '해커에게 계정을 빼앗길수도 있습니다.', style: 'color: white; font-size: 16px;' },

    ];

    const emitWarning = () => {
      console.clear(); // 콘솔 초기화
      warningMessages.forEach((msg, index) => {
        setTimeout(() => {
          console.log(`%c${msg.message}`, msg.style);
        }, index * 1000); // 각 메시지를 1초 간격으로 표시
      });
    };

    emitWarning();

    // 개발자 도구가 열릴 때마다 경고 메시지를 다시 출력
    window.addEventListener('devtoolschange', (event) => {
      if (event.detail.isOpen) {
        emitWarning();
      }
    });
  }, []);

  return null;
}